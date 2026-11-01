import mongoose from "mongoose";

const documentChunkSchema=mongoose.model(
    {
        text:{
            type:String,
            required:true
        },
        embedding:{
            type:[number],
            required:true
        },
        metadata:{
            source:{
                type:String,
                required:true
            },
            page:{
                type:Number
            }
        }
    },
    {timestamps:true}
)


const DocumentChunk=mongoose.model(
    "DocumentChunk",documentChunkSchema
)

export default DocumentChunk