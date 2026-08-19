# JSON contract v2

Return only one JSON object with exactly these keys: `goal`, `constraints`, `evidence`, `result`, and `next`. Every scalar value must be a non-empty string. `constraints` must be a non-empty array of non-empty strings. `evidence` must be a non-empty array of objects containing exactly `reference` and `claim`, both non-empty strings. Inspect the supplied repository and use real fixture-relative source references such as `src/file.ts:1`; never include the temporary fixture directory or an absolute path. Do not invent findings, add keys, or include prose outside the object.
