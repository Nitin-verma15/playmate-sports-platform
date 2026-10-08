import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import {
  createUserSchema,
  updateUserSchema,
  updateSportsSchema,
} from "../validators/userSchemas";
import * as userController from "../controllers/usercontroller";

const router = Router();

router.use(authenticate);

router.post("/me", validate(createUserSchema), userController.createProfile);
router.get("/me", userController.getProfile);
router.put("/me", validate(updateUserSchema), userController.updateProfile);
router.put("/me/sports", validate(updateSportsSchema), userController.updateSports);
router.get("/me/games", userController.getUserGames);


export default router;
