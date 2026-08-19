# JSON contract v1

Return only one JSON object with exactly these keys: `goal`, `constraints`, `evidence`, `result`, and `next`. `constraints` is a non-empty array of strings. `evidence` is a non-empty array of `{ "reference": string, "claim": string }`. All other values are non-empty strings. Preserve fixture phrases verbatim; evidence references use the supplied syntactic `path:line` values. Do not add keys, prose, markdown, or repository findings.
