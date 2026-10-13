import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import {
  createGameSchema,
  updateGameSchema,
} from "../validators/gameSchemas";
import * as gameController from "../controllers/gameController";

const router = Router();

router.get("/", gameController.getGames);
router.get("/:id", gameController.getGameById);

router.post("/", authenticate, validate(createGameSchema), gameController.createGame);
router.put("/:id", authenticate, validate(updateGameSchema), gameController.updateGame);
router.delete("/:id", authenticate, gameController.cancelGame);

router.post("/:id/join", authenticate, gameController.joinGame);
router.post("/:id/leave", authenticate, gameController.leaveGame);

export default router;
