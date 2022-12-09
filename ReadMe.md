# JEST

- 페이스북에서 제공하는 테스트 프레임워크

## [출처: 서적 Node.js 교과서](https://search.shopping.naver.com/book/catalog/32490505671?cat_id=50010881&frm=PBOKPRO&query=Nodejs+%EA%B5%90%EA%B3%BC%EC%84%9C&NaPm=ct%3Dlbftleo0%7Cci%3D4ee5c0a0280509d31235742ed712309cf1f3bdd0%7Ctr%3Dboknx%7Csn%3D95694%7Chk%3D301d76bbdecf6a56788b95a22e14658fedbf7e50)

# 1. Unit Test

> "1. Unit Test" 폴더를 참고하기

@@ 주의! 이 코드는 테스트 코드 학습만을 위한 목적으로 npm test를 제외한 다른 코드동작은 원활하게 진행되지 않습니다.

## 1. server.js, app.js

<br> server.js에는 실질적으로 서버를 가동하는

```
app.listen(~~)
```

이 존재합니다. 이는 서버를 가동하는 listen메소드가 app.js에 존재하게 되면 app.js파일을 이용한 테스트를 진행시 실제로 서버가 가동되는 문제가 발생하기 때문입니다.

- 테스트를 진행시에는 서버를 실제로 가동할 필요가 없습니다.

## 2. isLoggedIn

```
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("Require login");
  }
};
```

위의 함수는 passport를 이용한 경우 유저가 로그인을 한 상태인지 확인하는 미들웨어 함수입니다.

어찌보면 어려워보일지 몰라도 결국 req.isAuthenticated()의 값이 true이냐 false이냐에 따라 반환값이 달라지는 간단한 함수입니다.

이 때 req, res, next는 실제 서버를 켠 상태가 아니기 때문에 테스트 코드에서 값을 만들어주어야 합니다.

이를 mocking이라고 하는겁니다!

```
describe("isLoggedIn", () => {
  // 반환값이 res.status().send() 꼴은 메소드 체이닝이 가능해야 하므로 res.status => res를 반환해주어야 함.
  // 메소드 체이닝: OOP에서 여러 메소드를 이어서 호출하는 문법
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };
  const next = jest.fn();
  test("If  user login is success, next is called once", () => {
    // req안의 isAuthenticated는 true를 반환

    const req = {
      isAuthenticated: jest.fn(() => true),
    };
    isLoggedIn(req, res, next);
    // next는 한 번 호출될 것임.
    expect(next).toBeCalledTimes(1);
  });
```

user.test.js의 10~27라인

---

위의 코드에서 jest.fn() 이라는 부분이 변수를 모킹한 것입니다.

isLoggedIn(req, res, next); 은 req, res, next 3개의 매개변수를 보내주어야 하니 이 셋을 모킹시켜주는 것입니다.

반환값을 지정해주고 싶다면 status: jest.fn(() => res) 꼴로 작성을 해줍니다.

```
const req = {
      isAuthenticated: jest.fn(() => true),
    };
```

부분을 집중해보면 매개변수로 보내는 req에 객체를 넣고 그 안에 프로퍼티를 넣어준 모습입니다.

이렇게 작성을 해주면 req.isAuthenticated()는 true라는 값을 반환하게 될 것이고 '로그인을 성공적으로 한 것 처럼' 만들 수 있게 되는겁니다.

---

## 3. get_user_status

```
const User = require("./models/User.js");

const get_user_status = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { name: req.user.name } });
    if (user) {
      await user.get_age(parseInt(req.params.id, 10));
      res.send("success");
    } else {
      res.status(404).send("no user");
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};
```

app.js

다시 말씀드리지만 위 코드는 정상적으로 동작하지 않습니다.

지금 집중해야 할 것은 User는 sequelize를 이용해 User DB와 연결하는 것을 가정한 상태라는 것입니다.

---

```
jest.mock("./models/User.js");
const User = require("./models/User.js");

const { get_user_status } = require("./app");
describe("get_user", () => {
  const req = {
    user: { name: "권영" },
    params: { id: 1 },
  };
  const res = {
    status: jest.fn(() => {
      res;
    }),
    send: jest.fn(),
  };
  const next = jest.fn();

  test("If exist user, return success", async () => {
    User.findOne.mockReturnValue(
      Promise.resolve({
        get_age(id) {
          return Promise.resolve(true);
        },
      })
    );
    await get_user_status(req, res, next);
    expect(res.send).toBeCalledWith("success");
  });
});
```

user.test.js

---

위의 user.test.js코드를 보면 req, res, next를 각자 모킹해주었습니다.

가장 윗줄

```
jest.mock("./models/User.js");
const User = require("./models/User.js");
```

이 부분에 집중을 해보면 models폴더 안의 User.js에 접근하는 부분을 모킹했습니다.

이는 실제 테스트 과정에서 현재 사용하고 있는 DB에 실질적인 접근을 하지 않기 위함입니다. 위험부담이 크니까요!

이처럼 JEST는 모듈또한 모킹화 할 수 있습니다. 이 모킹한 User는

```
test("If exist user, return success", async () => {
    User.findOne.mockReturnValue(
      Promise.resolve({
        get_age(id) {
          return Promise.resolve(true);
        },
      })
    );
    await get_user_status(req, res, next);
    expect(res.send).toBeCalledWith("success");
  });
```

이 부분에서 사용되는데 이는 app.js의

```
const user = await User.findOne({ where: { name: req.user.name } });
    if (user) {
      await user.get_age(parseInt(req.params.id, 10));
```

이 부분과 연결됩니다.

await은 기본적으로 Promise를 반환하기 때문에 mockReturnValue를 이용해 User.findOne의 결과값을 모킹해 만들어주고 그 안에 user.get_age 메소드를 만들어 값을 반환해줍니다.

결과적으로

```
 if (user) {
      await user.get_age(parseInt(req.params.id, 10));
      res.send("success");
    } else {
```

에서 user 는

```
Promise.resolve({
        get_age(id) {
          return Promise.resolve(true);
        },
      })
```

를 반환해주고 user.get_age 함수는 true를 반환해 줄 것이고 res.send는 'success'를 반환하게 됩니다.

---

# 2. 파일 실행

이 폴더에서는 Jest 프레임워크만 사용합니다.

npm ci 이후

npm test를 입력하면 파일을 실행 할 수 있습니다.

(하나의 테스트는 의도한 실패 케이스입니다.)

```
 FAIL  ./calc.test.js
  ✓ 1+1 == 2 (2 ms)
  isLoggedIn
    ✓ If  user login is success, next is called once
    ✓ If  user login is not success, return 'Require login' (1 ms)
    ✕ Error' (3 ms)
  get_user
    ✓ If exist user, return success (1 ms)

  ● isLoggedIn › Error'

    expect(jest.fn()).toBeCalledTimes(expected)

    Expected number of calls: 0
    Received number of calls: 1

      49 |     // 18라인 테스트에서 next는 이미 한 번 호출되었기 때문에 isAuthenticated가 false임에도 아래 'next는 0번 호출'은 실패를 반환하게 됩니다.
      50 |     // 주의해야 할 부분!
    > 51 |     expect(next).toBeCalledTimes(0);
         |                  ^
      52 |     expect(res.send).toBeCalledWith("Require login");
      53 |   });
      54 | });

      at Object.toBeCalledTimes (calc.test.js:51:18)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 4 passed, 5 total
Snapshots:   0 total
Time:        0.293 s, estimated 1 s
Ran all test suites.
```
