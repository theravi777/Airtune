const jwt = require('jsonwebtoken');

async function authArtist(req, res, next) { // Middleware function to authenticate artist users
    
    const token = req.cookies.token;  // Get the token from cookies

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }   

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify the token 
        
        if (decoded.role !== 'artist') {  // Check if the user is an artist
            return res.status(403).json({ message: 'Forbidden' });
        }   

        req.user = decoded;  // Attach the decoded user information to the request object

         next();  // Call the next middleware function if authentication is successful

} catch (error) {
    console.log(error);
        return res.status(401).json({ message: 'Invalid token' });
    }   

   
}

async function authUser(req, res, next) { // Middleware function to authenticate regular users
    
    const token = req.cookies.token;  // Get the token from cookies

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }   

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify the token 

        req.user = decoded;  // Attach the decoded user information to the request object
           
        next();  // Call the next middleware function if authentication is successful
   
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = {authArtist, authUser};  // Export the authArtist and authUser middleware functions for use in other parts of the application
