import { scrape } from "./scrapper.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import fs from "fs";
import util from "util";

import * as dotenv from "dotenv";
dotenv.config();

const readFile = util.promisify(fs.readFile);

await scrape();

export const run = async () => {
  const rawDocs = await readFile("./output_docs/output.txt", "utf8");

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 20,
  });

  const splitedDocs = await splitter.createDocuments([rawDocs]);

  //Load the docs into the vector store
  const vectorStore = await FaissStore.fromDocuments(
    splitedDocs,
    new OpenAIEmbeddings()
  );

  const model = new OpenAI({});

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
  const res = await chain.call({
    query:
      "Can you provide a simple code snippet about how to create a vector store?",
  });
  console.log({ res });
};

await run();
