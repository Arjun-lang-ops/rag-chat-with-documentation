import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf";
import {RecursiveCharacterTextSplitter} from " @langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

import DocumentChunk from "../models/documentChunk.js";
import { cleanText } from "../utils/textCleaner.js";

const embeddings=new GoogleGenerativeAIEmbeddings({
    model:"gemini-embedding-001",
    apikey:"########"
})

export const ingestPDF=async(filePath,sourceName)=>{
    const loader= new PDFLoader(filePath);
    const documents=await loader.load();

    const cleanedDocuments = documents.map((document)=>({
        pageContent:cleanText(document.pageContent),
        metadata:{
            source:sourceName,
            page:document.metadata.loc?.pageNumber
        }
    }))

    const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  });

  const chunks= await splitter.splitDocuments(cleanedDocuments);

  const texts=chunks.map((chunk)=>chunk.pageContent);

  const vectors= await embeddings.embedDocuments(texts);

  const records=chunks.map((chunk,index)=>({
    text:chunk.pageContent,
    embedding:vectors[index],
    metadata:{
        source:sourceName,
        page:chunk.metadata.page
    }
  }))

  await DocumentChunk.insertMany(records);

  return {
    totalPages: documents.length,
    totalChunks: chunks.length
  };
}