import { prisma } from "./base.js";

// register user
export const registerUser = async (email, password) => {
  // check if user exists
  const present = await prisma.user.findUnique({ where: { email: email } });

  let newuser;
  // user doesnt exist,  create new
  if (present === null) {
    newuser = await prisma.user.create({
      data: {
        email: email,
        password: password,
      },
    });
  } else {
    newuser = null;
  }

  return newuser;
};

// finduserbyid
export const findUserById = async (id) => {
  const found = await prisma.user.findUnique({ where: { id: id } });
  return found;
};

// finduserbyemail
export const findUserByEmail = async (email) => {
  const found = await prisma.user.findUnique({ where: { email: email } });
  return found;
};
