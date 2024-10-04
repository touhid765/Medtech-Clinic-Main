import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = ( res, userId, tokenName) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{
        expiresIn: '7d',
    });
    
    res.cookie(tokenName,token,{
        httpOnly: true,
        secure : process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return token;
}