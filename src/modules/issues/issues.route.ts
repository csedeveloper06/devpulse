import Router from "express";
import { issueController } from "./issues.controller";

const router = Router();

router.post("/", issueController.createIssue);

router.get("/", issueController.createIssue);

router.get("/:id", issueController.createIssue);

router.patch("/:id", issueController.createIssue);

router.delete("/:id", issueController.createIssue);

export const issueRoute = router;
