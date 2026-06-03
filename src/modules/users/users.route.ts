import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { userController } from "./users.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "./users.constant";
import type { UserRole } from "./users.interface";

const router = Router();

router.post("/", userController.createUser);

router.get(
  "/",
  auth(USER_ROLE.MAINTAINER as UserRole),
  userController.getAllUsers,
);

router.get("/:id", userController.getSingleUser);

router.put("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

export const userRoute = router;
