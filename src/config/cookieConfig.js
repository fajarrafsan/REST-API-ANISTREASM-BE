const isSecure = process.env.COOKIE_SECURE === 'true';
const sameSite = process.env.COOKIE_SAMESITE || 'none';


export const cookieConfig = {
    accessToken: {
        httpOnly: true,
        secure: isSecure,
        sameSite: sameSite,
        maxAge: 15 * 60 * 1000
    },
    refreshToken: {
        httpOnly: true,
        secure: isSecure,
        sameSite: sameSite,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
};

export default cookieConfig;