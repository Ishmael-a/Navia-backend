import { body } from "express-validator";
import mongoose from "mongoose";
import validator from "validator";
import { hashPassword } from "../helpers/hashPassword";
import { comparePassword } from "../helpers/comparePassword";
import { compare } from "bcrypt";


interface IUser{
    username: string,
    email: string,
    password: string,
    role?: "user"|"admin",
    createdAt?: Date,
    updatedAt?: Date
}

interface IUserModel extends mongoose.Model<IUser> {
    signup(body: {
        username: string;
        email: string;
        password: string;
        role?: "user" | "admin";
    }): Promise<mongoose.Document<IUser> & IUser>;
    login(body: {
        email: string;
        password: string;
    }): Promise<mongoose.Document<IUser> & IUser>;
}

const userSchema = new mongoose.Schema<IUser>({

    username: {
        type: mongoose.Schema.Types.String,
        unique: true,
        required: [true, "Username is required"],
        minLength: [3, "Your username should should be of minimum length 3"],
        maxLength: [24, "Your username should should be of maximum length 24"] 
    },
    email: {
        type: mongoose.Schema.Types.String,
        unique: true,
        lowercase: true,
        required: [true, "Email is required"],
        minLength: [3, "Your email should be of minimum length 3"],
        validate: [validator.isEmail, "Invalid Email"]
    },
    password: {
        type: mongoose.Schema.Types.String,
        unique: true,
        required: [true, "Password is required"],
        minLength: [3, "Your password should should be of minimum length 3"],
    },
    role: { 
        type: mongoose.Schema.Types.String, 
        enum: ['user', 'admin'], 
        default: 'user',
    },
    createdAt: { 
        type: mongoose.Schema.Types.Date, 
        default: Date.now ,
    },
    updatedAt: { 
        type: mongoose.Schema.Types.Date, 
        default: Date.now ,
    },
})


userSchema.post("save", (document, next) => {
    console.log("User is about to be saved to the database with pass: ", document._id);
    next();
})


userSchema.pre("save", (next) => {
    console.log("User is about to be saved to the database ");
    next();
})


interface SignupRequestBody {
    username: string,
    email: string,
    password: string,
    role: "user"|"admin",
}

userSchema.statics.signup = async function(body: SignupRequestBody) {
    const { username, email, password, role } = body;

    if(!username || !email || !password){
        const error = { username: "", email: "", password: "" };
        if(!username){
            error.username ="Username must be filled"
        }
        if(!email){
            error.email ="Email must be filled"
        }
        if(!password){
            error.password ="Password must be filled"
        }
        throw new Error(JSON.stringify(error));
    }
    
    if(!validator.isEmail(email)){
        throw new Error("Enter A valid Email");
    }

    // Validate password strength
    if (!validator.isStrongPassword(password)) {
        throw new Error('Password is not strong enough');
    }

    //check if username already exists
    const existingUsername = await this.findOne({ username: username });
    if(existingUsername){
        throw new Error('Username already exists');
    }

    //check if email already exists
    const existingUseremail = await this.findOne({ email: email });
    if(existingUseremail){
        throw new Error('Email already exists');
    }

    //hashpassword
    const hashedPassword = await hashPassword(password);

    const newUser = new this({username, email, password: hashedPassword, role});
    const savedUser = newUser.save();

    return savedUser;

}

interface LoginRequestBody {
    email: string,
    password: string,
    role: "user"|"admin",
}

userSchema.statics.login = async function(body: LoginRequestBody) {
    const { email, password } = body;

    if( !email || !password){
        const error = { email: "", password: "" };
        if(!email){
            error.email ="Email must be filled"
        }
        if(!password){
            error.password ="Password must be filled"
        }
        throw new Error(JSON.stringify(error));
    }
    
    if(!validator.isEmail(email)){
        throw new Error("Enter A valid Email");
    }

    // Validate password strength
    if (!validator.isStrongPassword(password)) {
        throw new Error('Password is not strong enough');
    }

    //check if email already exists
    const existingUser = await this.findOne({ email: email });
    if (!existingUser) {
        throw new Error('incorrect email');
    }

    // Check if password matches
    const isMatch = await comparePassword(password, existingUser.password);
    if (!isMatch) {
        throw new Error('incorrect password');
    }

    console.log("Logged In Successfully!");

    return existingUser; // Return the user object

}

export const userModel = mongoose.model<IUser, IUserModel>('user', userSchema);