const {ImageKit} = require("@imagekit/nodejs");


const ImageKitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
})

async function uploadFile(file) {
    const result = await ImageKitClient.files.upload({  // Upload the file to ImageKit
        file,            // The file to be uploaded
        fileName: "music_" + Date.now(),  // Generate a unique file name using the current timestamp
        folder: "yt-complete-backend/music"   // Specify the folder in ImageKit where the file will be stored
    });
    return result;  // Return the result of the file upload
}

module.exports = {
    uploadFile,  // Export the uploadFile function for use in other parts of the application
};