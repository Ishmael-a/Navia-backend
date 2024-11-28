import bcrypt from "bcrypt";


export const comparePassword = async (plainPassword: string, hashedPassword: string) => {

    const isPassword = await bcrypt.compare(plainPassword, hashedPassword);

    return isPassword;
}