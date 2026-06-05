import Router from "express";
import { issueController } from "./issues.controller";
import { USER_ROLE } from "../users/users.constant";
import auth from "../../middleware/auth";
import type { UserRole } from "../users/users.interface";

const router = Router();

router.post(
  "/",
  auth(USER_ROLE.CONTRIBUTOR as UserRole, USER_ROLE.MAINTAINER as UserRole),
  issueController.createIssue,
);

// router.get("/", issueController.createIssue);

// router.get("/:id", issueController.createIssue);

// router.patch("/:id", issueController.createIssue);

// router.delete("/:id", issueController.createIssue);

export const issueRoute = router;
