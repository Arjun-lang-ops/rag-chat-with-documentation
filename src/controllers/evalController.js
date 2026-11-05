import fs from "fs";
import path from "path";
import { runRAGTriadBenchmark } from "../eval/runBenchmark.js";
import { evaluateRAGTriad } from "../eval/ragTriadEval.js";
import benchmarkDataset from "../eval/benchmarkDataset.js";

/**
 * Runs the automated RAG Triad Benchmark.
 */
export const runBenchmark = async (req, res, next) => {
  try {
    const { useLivePipeline = false, threshold = 0.70, customCases } = req.body || {};
    const report = await runRAGTriadBenchmark({
      useLivePipeline,
      threshold,
      customCases
    });

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns the latest saved evaluation benchmark report.
 */
export const getLatestReport = async (req, res, next) => {
  try {
    const reportPath = path.resolve("eval-results", "latest-rag-triad-report.json");
    if (!fs.existsSync(reportPath)) {
      // Run benchmark on the fly if no report exists
      const report = await runRAGTriadBenchmark({ useLivePipeline: false });
      return res.status(200).json({
        success: true,
        report
      });
    }

    const data = fs.readFileSync(reportPath, "utf-8");
    res.status(200).json({
      success: true,
      report: JSON.parse(data)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Evaluates a single query/context/answer triad.
 */
export const evaluateSingle = async (req, res, next) => {
  try {
    const { query, contextChunks, answer, threshold = 0.70 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "query is required"
      });
    }

    const result = await evaluateRAGTriad({
      query,
      contextChunks: contextChunks || [],
      answer: answer || "",
      threshold
    });

    res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns benchmark dataset definition.
 */
export const getBenchmarkCases = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      dataset: benchmarkDataset
    });
  } catch (error) {
    next(error);
  }
};

