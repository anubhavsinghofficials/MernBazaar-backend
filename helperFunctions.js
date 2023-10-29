import dataUriParser from 'datauri/parser.js'
import {v2 as cloudinary} from 'cloudinary'



// Cloudinary __________________________________________________________________

const getUri = (file) => {
    const parser = new dataUriParser()
    const fileNameParts = file.name.split('.')
    const extName = fileNameParts[fileNameParts.length-1]
    return parser.format(extName,file.data)
}


export const uploadToCloudinary = async (files,thumbnailObject,additionalArray) => {
    let index = 0
    for (const file of files) {
        const dataUriObject = getUri(file)
        const myCloud = await cloudinary.uploader.upload(dataUriObject.content,{
            folder:"MernBazaar"
        })
        if (index === 0) {
            thumbnailObject.public_id = myCloud.public_id
            thumbnailObject.url = myCloud.secure_url
        } else {
            additionalArray.push({public_id:myCloud.public_id, url:myCloud.secure_url})
        }
        index++
    }
}