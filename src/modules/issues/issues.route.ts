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

router.get("/", issueController.getAllIssues);

router.get("/:id", issueController.getSingleIssue);

router.patch(
  "/:id",
  auth(USER_ROLE.CONTRIBUTOR as UserRole, USER_ROLE.MAINTAINER as UserRole),
  issueController.UpdateIssue,
);

router.delete(
  "/:id",
  auth(USER_ROLE.MAINTAINER as UserRole),
  issueController.deleteIssue,
);

export const issueRoute = router;
