import csv
import io
import os

import boto3


def handler(event, context):
    rows = event if isinstance(event, list) else []
    fieldnames = list(rows[0].keys()) if rows and isinstance(rows[0], dict) else []

    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    if fieldnames:
        writer.writeheader()
        for row in rows:
            writer.writerow({key: row.get(key, "") for key in fieldnames})

    bucket_name = os.environ["BUCKET_NAME"]
    key = "results/output.csv"

    boto3.client("s3").put_object(
        Bucket=bucket_name,
        Key=key,
        Body=buffer.getvalue().encode("utf-8"),
        ContentType="text/csv",
    )

    return {
        "status": "success",
        "bucket": bucket_name,
        "key": key,
        "rowCount": len(rows),
    }
