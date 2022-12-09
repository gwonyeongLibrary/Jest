/**
 * expect(함수, 변수 등등).toEqual(x) : 예상한 값이 x와 같은지 테스트
 */
test("1+1 == 2", () => {
  expect(1 + 1).toEqual(2);
});

const { isLoggedIn } = require("./app.js");

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
  test("If  user login is not success, return 'Require login'", () => {
    // req안의 isAuthenticated는 false 반환

    const req = {
      isAuthenticated: jest.fn(() => false),
    };
    isLoggedIn(req, res, next);

    // 18라인 테스트에서 next는 이미 한 번 호출되었기 때문에 isAuthenticated가 false임에도 아래 'next는 1번 호출'은 성공을 반환하게 됩니다.
    // 주의해야 할 부분!
    expect(next).toBeCalledTimes(1);
    expect(res.send).toBeCalledWith("Require login");
  });
  // 일부로 테스트를 실패
  test("Error'", () => {
    // req안의 isAuthenticated는 false 반환

    const req = {
      isAuthenticated: jest.fn(() => false),
    };
    isLoggedIn(req, res, next);
    // next는 한 번 호출 된 상태일 것임. @@@@@@@@@@@@@@@@@@
    // isAuthenticated가 false임에도 아래 'next는 0번 호출'은 실패를 반환하게 됩니다.
    // 주의해야 할 부분!
    expect(next).toBeCalledTimes(0);
    expect(res.send).toBeCalledWith("Require login");
  });
});

// ----------------------------------------------

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
