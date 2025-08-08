#!/usr/bin/env python3
"""
Flask Predictor Service for Regular Shopping App

This service provides prediction functionality for determining the probability
of items being in the refrigerator based on category and days since last
purchase.
"""

import json
import logging
import os
import time
from datetime import datetime
from typing import Dict

from flask import Flask, jsonify, request
from flask_cors import CORS

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables for metrics
request_count = 0
category_counts = {}
response_times = []


def load_probability_matrix() -> Dict:
    """Load probability matrix from JSON file."""
    try:
        matrix_path = os.path.join(os.path.dirname(__file__), "probability_matrix.json")
        with open(matrix_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error("Probability matrix file not found")
        return {}
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in probability matrix: {e}")
        return {}


def get_probability(category_id: str, days_since_purchase: int) -> float:
    """Get probability for a category and days since purchase."""
    matrix = load_probability_matrix()

    if not matrix:
        logger.warning("Probability matrix is empty, returning default")
        return 0.5

    category_data = matrix.get(category_id, {})
    if not category_data:
        logger.warning(
            f"Category {category_id} not found in matrix, " f"returning default"
        )
        return 0.5

    # Find the closest day range
    days_ranges = sorted(
        category_data.keys(), key=lambda x: int(x.split("-")[0]) if x != "31+" else 31
    )

    for day_range in days_ranges:
        if day_range == "31+":
            if days_since_purchase >= 31:
                return category_data[day_range]
        else:
            start_day, end_day = map(int, day_range.split("-"))
            if start_day <= days_since_purchase <= end_day:
                return category_data[day_range]

    # If no range found, return the last available probability
    if days_ranges:
        return category_data[days_ranges[-1]]

    return 0.5


def log_metrics(category_id: str, response_time: float):
    """Log metrics for monitoring."""
    global request_count, category_counts, response_times

    request_count += 1
    category_counts[category_id] = category_counts.get(category_id, 0) + 1
    response_times.append(response_time)

    # Keep only last 100 response times
    if len(response_times) > 100:
        response_times.pop(0)

    avg_response_time = (
        sum(response_times) / len(response_times) if response_times else 0
    )

    logger.info(
        f"Request #{request_count} - Category: {category_id}, "
        f"Response time: {response_time:.2f}ms, "
        f"Avg response time: {avg_response_time:.2f}ms"
    )


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify(
        {
            "status": "OK",
            "message": "Predictor service is running",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat(),
        }
    )


@app.route("/predict", methods=["POST"])
def predict():
    """Predict probability of items being in refrigerator."""
    start_time = time.time()

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        items = data.get("items", [])
        if not items:
            return jsonify({"error": "No items provided"}), 400

        predictions = []

        for item in items:
            category_id = item.get("categoryId")
            days_since_purchase = item.get("daysSinceLastPurchase")

            if not category_id:
                return jsonify({"error": "categoryId is required"}), 400

            if days_since_purchase is None:
                return jsonify({"error": "daysSinceLastPurchase is required"}), 400

            if days_since_purchase < 0:
                return (
                    jsonify({"error": "daysSinceLastPurchase must be non-negative"}),
                    400,
                )

            probability = get_probability(category_id, days_since_purchase)

            predictions.append(
                {
                    "categoryId": category_id,
                    "daysSinceLastPurchase": days_since_purchase,
                    "probability": round(probability, 2),
                }
            )

        response_time = (time.time() - start_time) * 1000  # Convert to milliseconds

        # Log metrics for the first item (for simplicity)
        if predictions:
            log_metrics(predictions[0]["categoryId"], response_time)

        return jsonify(
            {"predictions": predictions, "response_time_ms": round(response_time, 2)}
        )

    except Exception as e:
        logger.error(f"Error in predict endpoint: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/metrics", methods=["GET"])
def get_metrics():
    """Get service metrics."""
    avg_response_time = (
        sum(response_times) / len(response_times) if response_times else 0
    )

    return jsonify(
        {
            "request_count": request_count,
            "category_counts": category_counts,
            "average_response_time_ms": round(avg_response_time, 2),
            "total_response_times": len(response_times),
        }
    )


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {error}")
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    # Load probability matrix on startup
    matrix = load_probability_matrix()
    if matrix:
        logger.info(f"Loaded probability matrix with {len(matrix)} categories")
    else:
        logger.warning("Failed to load probability matrix")

    # Run the application
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
