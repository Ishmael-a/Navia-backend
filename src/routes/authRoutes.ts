import Router from 'express';
import { getUsers, registerUser_get, registerUser_post, loginUser_get, loginUser_post } from "../controllers/authControllers";
import checkExistingToken from '../middleware/checkExistingToken';

const router = Router();

router.get("/api/users", getUsers);

router.get("/api/users/register", registerUser_get);
router.get("/api/users/login", loginUser_get);

router.post("/api/users/register", checkExistingToken, registerUser_post);
router.post("/api/users/login", checkExistingToken, loginUser_post);

export default router;