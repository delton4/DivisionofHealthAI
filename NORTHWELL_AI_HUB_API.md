# Northwell AI Hub API Documentation

> **Version:** 1.0.0 | **OpenAPI:** 3.1.0
> **Base URL:** `https://api.ai.northwell.edu` (Production)
> **Spec URL:** `https://ai-hub-api-970320824155.us-east4.run.app/spec`
> **Portal:** `https://portal.ai.northwell.edu/docs`

Northwell Health's internal enterprise AI services API. This API powers the AI Hub frontend application and makes secure AI services available to all Northwell development teams.

---

## Authentication

All endpoints require an API key passed via header:

| Header | Type | Description |
|--------|------|-------------|
| `X-API-Key` | `apiKey` | Required for all requests |

---

## Important Conventions

- **All text inputs (prompt, context, messages) must be Base64 encoded.**
- **`ad_object_id`** is the Active Directory Object ID of the API caller (UUID format). Required on virtually every request.
- **`debug`** (boolean, default `false`) can be set to `true` on most requests to include diagnostic data in the response.
- When multiple models are specified, they are called **asynchronously** in parallel.
- All UUIDs follow the pattern: `^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`

---

## Available Models

The following models can be specified in the `models` array:

| Model ID | Image Support | Multimedia Support | Thinking Config |
|----------|:------------:|:------------------:|:---------------:|
| `o3` | Yes | No | No |
| `o4-mini` | Yes | No | No |
| `gpt-5` | Yes | No | No |
| `gpt-5-mini` | Yes | No | No |
| `gpt-5-nano` | Yes | No | No |
| `gpt-5.1` | Yes | No | No |
| `gpt-5.2` | Yes | No | No |
| `claude-haiku-4.5` | Yes | No | Yes |
| `claude-sonnet-4.5` | Yes | No | Yes |
| `claude-opus-4.5` | Yes | No | Yes |
| `claude-opus-4.6` | Yes | No | Yes |
| `gemini-2.5-flash-lite` | Yes | Yes | No |
| `gemini-2.5-flash` | Yes | Yes | No |
| `gemini-2.5-pro` | Yes | Yes | No |

- **Multimedia** (audio/video) is only supported by Gemini models.
- **Thinking config** is only supported by Claude models and O-Series models.

---

## API Sections

1. [Generative AI Services](#1-generative-ai-services)
2. [Tasks](#2-tasks)
3. [Knowledge Bases](#3-knowledge-bases)
4. [Supporting Services](#4-supporting-services)
5. [Feedback](#5-feedback)
6. [Cache](#6-cache)

---

## 1. Generative AI Services

> Securely access large language models and AI powered services

### POST `/generative` -- Submit prompts to large language models

Use this endpoint for all generic requests to LLMs. Features: async model execution, multimodal image input, advanced parameter config.

**Parameters:** None (all data in request body)

**Request Body** (`application/json`) -- Schema: `GenerativeResponseRequest`

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `prompt` | `string` | Yes | Base64 encoded input text |
| `ad_object_id` | `string` | Yes | Active Directory ID of API caller |
| `models` | `string[]` | Yes | Array of model IDs to invoke (called async when multiple) |
| `context` | `string` | No | Base64 encoded context/instructions to supply to the model along with the prompt. Not relevant when running a predefined Task. |
| `debug` | `boolean` | No | Default `false`. When true, diagnostic data included in response |
| `image` | `array` | No | Base64 encoded images for submission to supported models |
| `multimedia` | `array` | No | Audio/video content details (Gemini models only) |
| `previous_messages` | `array` | No | Established message history (min 2 items) |
| `advanced` | `object` | No | Advanced config to influence model output |
| `extension` | `string[]` | No | Extension codes for extensions that can assist with handling input |
| `knowledge_base` | `string[]` | No | IDs of knowledge bases to search for assisting with input |

#### `image` array item schema:

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `order` | `number` | Yes | Position of image when submitted to model |
| `b64_image` | `string` | Yes | Base64 string of the encoded image |
| `mime_type` | `string` | Yes | `image/jpeg` or `image/png` |

#### `multimedia` array item schema (Gemini models only):

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `uri` | `string` | Yes | GCS URI, GCS Signed URL, or public URL to multimedia file |
| `mime_type` | `string` | Yes | MIME type for the content at the URI |

#### `previous_messages` array item schema:

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `content` | `string` | No | Base64 encoded message |
| `order` | `number` | No | Order of message in conversation |
| `role` | `string` | No | `user` or `assistant` |

#### `advanced` object schema:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `max_tokens` | `number` | `800` | Maximum length of generated output in tokens |
| `temperature` | `number` | `0.5` | Randomness of output (0 = deterministic, 1 = most random) |
| `top_p` | `number` | `0.95` | Nucleus sampling parameter (0-1). Model considers minimal set of words whose cumulative probability exceeds this value |
| `thinking_config` | `object` | -- | Manually invoke thinking process for supported models |

#### `thinking_config` object schema:

Supported models: `claude-haiku-4.5`, `claude-opus-4.5`, `claude-sonnet-4.5`, `claude-opus-4.6`

| Field | Type | Description |
|-------|------|-------------|
| `claude` | `object` | Config for Anthropic Claude thinking. Contains `thinking_token_budget` (integer) -- number of tokens to allocate to thinking (must be less than total output tokens) |
| `o_series` | `object` | Config for OpenAI O-Series thinking. Contains `reasoning_effort` (string) -- `low`, `medium`, or `high` |

At least one property must be provided (`minProperties: 1`).

#### Example 1: Simple text request
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "context": "<base64 encoded system instructions>",
  "models": ["claude-3.5-sonnet", "gpt-4o", "gemini-1.5-pro"],
  "prompt": "<base64 encoded prompt>"
}
```

#### Example 2: Text with advanced parameters
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "advanced": {
    "max_tokens": 150,
    "temperature": 0.7,
    "top_p": 0.95
  },
  "context": "<base64 encoded system instructions>",
  "models": ["claude-3.5-sonnet", "gpt-4o", "gemini-1.5-pro"],
  "prompt": "<base64 encoded prompt>"
}
```

#### Example 3: Multimodal image request
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "image": [
    {
      "b64_image": "<base64 image data>",
      "mime_type": "image/jpeg",
      "order": 1
    },
    {
      "b64_image": "<base64 image data>",
      "mime_type": "image/png",
      "order": 2
    }
  ],
  "models": ["gpt-4o"],
  "prompt": "<base64 encoded prompt>"
}
```

#### Example 4: Audio/Video with Gemini (currently restricted)
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "document": [
    {
      "mime_type": "video/mp4",
      "uri": "gs://internal_project_bucket/video.mp4"
    },
    {
      "mime_type": "audio/mpeg",
      "uri": "www.public_website.com/audio.mp3"
    }
  ],
  "models": ["gemini-1.5-pro", "gemini-1.5-flash"],
  "prompt": "<base64 encoded prompt>"
}
```

**Responses:**

| Code | Description |
|------|-------------|
| `200` | Successful response with generative output |
| `400` | Bad request, details in error message |
| `500` | Internal server error |

#### 200 Response Schema (`GenerativeResponse`):

```json
{
  "data": {
    "generative_responses": [
      {
        "has_error": false,
        "processing_time_ms": 1234,
        "response": "string",
        "service_name": "string"
      }
    ]
  },
  "error": ["string"],
  "has_error": false,
  "id": "string",
  "processing_time_ms": 1234
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.generative_responses` | `array` | Array of responses from each model |
| `data.generative_responses[].has_error` | `boolean` | Whether this specific model response had an error |
| `data.generative_responses[].processing_time_ms` | `number` | Time taken for this model to respond |
| `data.generative_responses[].response` | `string` | The generated text response |
| `data.generative_responses[].service_name` | `string` | Name of the model service that generated the response |
| `error` | `string[]` | Top-level error messages |
| `has_error` | `boolean` | Whether the overall request had errors |
| `id` | `string` | Unique identifier for the response |
| `processing_time_ms` | `number` | Total processing time |

---

## 2. Tasks

> Create and manage custom AI prompts/instructions

Tasks are saved prompt/instruction sets that can be reused. They allow you to define a context (system message), advanced parameters, categories, and reference content that can be executed against models.

### DELETE `/task` -- Delete a Task

Permanently remove a Task from the Task Library.

**Request Body** (`application/json`) -- Schema: `DeleteTaskRequest`

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `task` | `string[]` | Yes | Array of task IDs (must be owned by the caller) to delete |
| `ad_object_id` | `string` | Yes | Active Directory object ID of caller |
| `debug` | `boolean` | No | Default `false` |

**Responses:** `200` Task deleted | `400` Malformed request | `500` Internal server error

---

### GET `/task` -- Get Tasks

Retrieves the Task definitions created by a user, plus global tasks they have access to.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `user_id` | `string` (UUID) | No | The user whose Tasks will be retrieved |
| `metadata_only` | `boolean` | No | Default `false`. If true, only metadata is returned |
| `task_id` | `string` (UUID) | No | Return a specific task by ID |
| `debug` | `boolean` | No | Default `false` |

**200 Response** (`TaskResponse`):

```json
{
  "data": {
    "task": [
      {
        "id": "uuid",
        "title": "string",
        "description": "string",
        "context": "<base64 encoded system message>",
        "category": ["string"],
        "created_by": "uuid",
        "created_datetime": "ISO datetime",
        "is_global": false,
        "references": ["uuid"],
        "advanced": {
          "max_tokens": 800,
          "temperature": 0.5,
          "top_p": 0.95
        }
      }
    ]
  },
  "debug": {},
  "error": ["string"],
  "has_error": false,
  "id": "uuid",
  "processing_time_ms": 1234
}
```

#### Task Object Schema:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (UUID) | Task identifier. Only provided when updating an existing task |
| `title` | `string` | Display name of the task |
| `description` | `string` | Detailed description about the task, its purpose, and intended usage |
| `context` | `string` | Base64 encoded context/system message defining the task |
| `category` | `string[]` | Categories to which this task belongs |
| `created_by` | `string` (UUID) | AD ID of the creating user |
| `created_datetime` | `string` | ISO datetime of creation time |
| `is_global` | `boolean` | Whether this task is available to all users |
| `references` | `string[]` | Array of transformed content UUIDs to use as reference |
| `advanced` | `object` | Advanced config (max_tokens, temperature, top_p) |

---

### POST `/task` -- Create or update a task

Save or update a Task (saved prompt/instruction set).

**Request Body** (`application/json`) -- Schema: `UpsertTaskRequest`

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `task` | `array` | Yes | Array of task objects to create or update |
| `ad_object_id` | `string` | Yes | Active Directory object ID of caller |
| `debug` | `boolean` | No | Default `false` |

#### Task item schema (within `task` array):

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `title` | `string` | Yes | Natural language title of Task |
| `description` | `string` | Yes | Detailed Task description |
| `context` | `string` | Yes | Base64 encoded user instructions (text) |
| `id` | `string` | No | UUID of task. Only provided when **updating** an existing task |
| `category` | `string[]` | No | Categories for the task |
| `advanced` | `object` | No | `max_tokens`, `temperature` (0-1), `top_p` (0-1) |
| `extensions` | `string[]` | No | Extension codes this Task can leverage |
| `knowledge_bases` | `string[]` | No | Corpus IDs this Task can access |
| `references` | `string[]` | No | Transformed content UUIDs to use as reference |

#### Example 1: Create a simple Task
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "task": [
    {
      "category": ["Administrative", "Meeting", "Summarization"],
      "context": "<base64 encoded system instructions>",
      "description": "This task helps staff create concise summaries of meeting minutes.",
      "title": "Summarize Meeting Minutes"
    }
  ]
}
```

#### Example 2: Create a Task with advanced config
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "task": [
    {
      "advanced": {
        "max_tokens": 500,
        "temperature": 0.4,
        "top_p": 0.9
      },
      "category": ["Project Management", "Reporting"],
      "context": "<base64 encoded system instructions>",
      "description": "Assists project managers in creating weekly status reports.",
      "title": "Generate Weekly Project Status Report"
    }
  ]
}
```

#### Example 3: Create a Task with References
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "task": [
    {
      "category": ["Administrative", "Meeting", "Summarization"],
      "context": "Use the attached template and instructions to process meeting transcripts.",
      "description": "Summarizes meeting minutes with a referenced template.",
      "references": ["892e8400-82b3-41d4-a716-446655440000"],
      "title": "Summarize Meeting Minutes"
    }
  ]
}
```

**Responses:** `200` Task created | `400` Malformed request | `500` Internal server error

---

### POST `/task/execute` -- Execute saved Tasks against LLMs

Use this endpoint to execute previously saved Tasks.

**Request Body** (`application/json`) -- Schema: `ExecuteTaskRequest`

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `prompt` | `string` | Yes | Base64 encoded input text |
| `ad_object_id` | `string` | Yes | Active Directory ID of caller |
| `models` | `string[]` | Yes | Models to execute against |
| `task_id` | `string` | Yes | ID of predefined Task. Retrieve IDs via `GET /task` |
| `debug` | `boolean` | No | Default `false` |
| `image` | `array` | No | Base64 encoded images (same schema as `/generative`) |
| `multimedia` | `array` | No | Audio/video details (Gemini only, same schema as `/generative`) |
| `previous_messages` | `array` | No | Message history (min 2 items, same schema as `/generative`) |

#### Example: Execute a saved Task
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "models": ["claude-3.5-sonnet", "gpt-4o", "gemini-1.5-pro"],
  "prompt": "<base64 encoded input>",
  "task_id": "892e8400-82b3-41d4-a716-446655441234"
}
```

**200 Response:** Same `GenerativeResponse` schema as `POST /generative`.

---

## 3. Knowledge Bases

> Create, manage, and search custom document corpora

Knowledge bases (corpora) are collections of documents used for retrieval-augmented generation (RAG). You can create corpora, import files, perform semantic retrieval, and generate AI responses grounded in your documents.

### DELETE `/corpus` -- Delete a corpus

Delete a corpus (knowledge base) from the registry. Removes all associated data and documents.

**Request Body** (`application/json`) -- Schema: `DeleteCorpusRequest`

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `ad_object_id` | `string` | Yes | Object ID of user |
| `corpus_name` | `string` | Yes | Name of the corpus. **NOTE: This is the `rag_id` property, NOT the display name.** |

#### Example:
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "corpus_name": "projects/123320824155/locations/us-central1/ragCorpora/1234583283205013504"
}
```

**Responses:** `200` Deleted | `400` Malformed | `500` Server error

---

### GET `/corpus` -- Get metadata for Knowledge Bases

Retrieves metadata for all Knowledge Bases that the user has access to.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `user_id` | `string` (UUID) | No | The user calling for KB metadata |
| `debug` | `boolean` | No | Default `false` |

**Responses:** `200` List of KBs and metadata | `400` Malformed | `500` Server error

---

### POST `/corpus` -- Create or update a corpus

**Request Body** (`application/json`) -- Schema: `CreateCorpusRequest`

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `ad_object_id` | `string` | Yes | Active Directory object ID |
| `title` | `string` | Yes | Title of the corpus |
| `description` | `string` | Yes | Description of the corpus |
| `storage_path` | `string` | Yes | Storage path of the corpus (e.g., `gs://knowledge_bases/customer_service`) |
| `debug` | `boolean` | No | Default `false` |
| `processing_config` | `object` | No | Custom document ingestion/processing parameters |

#### `processing_config` object:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `chunk_size` | `integer` | `512` | Chunk size in tokens |
| `chunk_overlap` | `integer` | `100` | Chunk overlap in tokens |
| `max_embedding_requests_per_min` | `integer` | `900` | Max embedding requests per minute |

#### Example 1: Create a new corpus
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "description": "A repository of customer service FAQs and solutions.",
  "storage_path": "gs://knowledge_bases/customer_service",
  "title": "Customer Service Knowledge Base"
}
```

#### Example 2: Create with custom processing config
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "description": "A repository of customer service FAQs and solutions.",
  "processing_config": {
    "chunk_overlap": 100,
    "chunk_size": 512,
    "max_embedding_requests_per_min": 900
  },
  "storage_path": "gs://knowledge_bases/customer_service",
  "title": "Customer Service Knowledge Base"
}
```

---

### DELETE `/corpus/file` -- Delete a specific file from a corpus

**Request Body** (`application/json`) -- Schema: `DeleteCorpusFileRequest`

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `ad_object_id` | `string` | Yes | Object ID of user |
| `file_name` | `string` | Yes | Official file name (not display name) |

#### Example:
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_name": "projects/1234567890/locations/us-central1/ragCorpora/1111111111/ragFiles/2222222222"
}
```

---

### GET `/corpus/file` -- Get Knowledge Base (Corpus) Files

Retrieves all files for the specified corpus.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `user_id` | `string` (UUID) | No | The user calling for files |
| `corpus_id` | `string` (UUID) | No | The Corpus ID to retrieve files for |
| `debug` | `boolean` | No | Default `false` |

---

### POST `/corpus/import` -- Import files into an existing corpus

Import files that will be transformed and stored in the corpus for retrieval.

**Request Body** (`application/json`) -- Schema: `ImportCorpusFilesRequest`

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `ad_object_id` | `string` | Yes | User Object ID |
| `id` | `string` | Yes | ID of corpus to import into |

#### Example:
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "id": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

### POST `/corpus/retrieval` -- Retrieve similar contexts from a corpus

Retrieve top similar contexts from a corpus based on input text for further processing or analysis.

**Request Body** (`application/json`) -- Schema: `CorpusRetrievalRequest`

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `ad_object_id` | `string` | Yes | User Object ID |
| `corpus_id` | `string` | Yes | ID of corpus |
| `input_text` | `string` | Yes | Input text for retrieval (base64 encoded) |
| `debug` | `boolean` | No | Default `false` |
| `retrieval_config` | `object` | No | Manual retrieval parameter control |

#### `retrieval_config` object:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `similarity_top_k` | `integer` | `3` | Number of top similar contexts to retrieve |
| `vector_distance_threshold` | `number` | `0.5` | Threshold for vector distance |

#### Example 1: Retrieve with custom params
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "corpus_id": "123e4567-e89b-12d3-a456-426614174000",
  "input_text": "<base64 encoded query>",
  "similarity_top_k": 5,
  "vector_distance_threshold": 0.7
}
```

#### Example 2: Retrieve with defaults
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "corpus_id": "123e4567-e89b-12d3-a456-426614174000",
  "input_text": "<base64 encoded query>"
}
```

**200 Response:** `GenerativeResponse` schema.

---

### POST `/corpus/retrieval/generative` -- Retrieve and generate from corpus

Retrieve and generate responses based on input text and selected generative model from a corpus. This combines retrieval with generation (RAG).

**Request Body** (`application/json`) -- Schema: `GenerativeCorpusRetrievalRequest`

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `ad_object_id` | `string` | Yes | User Object ID |
| `corpus_id` | `string` | Yes | ID of corpus |
| `input_text` | `string` | Yes | Input text for retrieval and generation |
| `model_name` | `string` | Yes | Generative model to use. Options: `gemini-2.5-flash-lite`, `gemini-2.5-flash`, `gemini-2.5-pro` |
| `debug` | `boolean` | No | Default `false` |
| `retrieval_config` | `object` | No | Same as `/corpus/retrieval` |

**Note:** Only Gemini models are supported for generative corpus retrieval.

#### Example 1: Basic generative retrieval
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "corpus_id": "123e4567-e89b-12d3-a456-426614174000",
  "input_text": "<base64 encoded query>",
  "model_name": "gemini-1.5-flash"
}
```

#### Example 2: With custom retrieval config
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "corpus_id": "123e4567-e89b-12d3-a456-426614174000",
  "input_text": "<base64 encoded query>",
  "model_name": "gemini-2.0-flash",
  "retrieval_config": {
    "similarity_top_k": 3,
    "vector_distance_threshold": 0.5
  }
}
```

**200 Response:** `GenerativeResponse` schema.

---

## 4. Supporting Services

> Additional services to make working with Generative AI more convenient

### POST `/services/transform` -- Transform content to LLM readable formatting

Transform content to LLM readable formatting, optionally saving for later retrieval.

**Request Body** (`application/json`) -- Schema: `TransformContentRequest`

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `ad_object_id` | `string` | No | Active Directory ID of caller |
| `data` | `array` | No | Details about data to transform (1-10 items) |
| `debug` | `boolean` | No | Default `false` |
| `save_transformed_content` | `boolean` | No | When true, content is stored and UUIDs returned for later retrieval or Task association |
| `use_ocr` | `boolean` | No | Enable OCR for PDF files when text extraction is insufficient |
| `ocr_config` | `object` | No | OCR processing configuration |

#### `data` array item schema:

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `uri` | `string` | Yes | Location of data. Can be internal GCS URI, signed GCS URL, or external website URL |
| `return_as_images` | `boolean` | No | Return as Base64 images instead of text (PDF only) |

#### Supported file types for transformation:

| File Type | MIME Type |
|-----------|----------|
| Word | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| PowerPoint | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| Excel | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| PDF | `application/pdf` |
| HTML | `text/html` |
| Plain Text | `text/plain` |
| Image | `image/png`, `image/jpeg` |

#### `ocr_config` object:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `ocr_service` | `string` | Cloud Vision | OCR service to use: `cloudvision` or `pytesseract` |
| `lang` | `string` | `eng` | Language code for OCR (e.g., `eng`, `spa`, `fra`) |
| `dpi` | `integer` | `300` | DPI for image rendering (72-600). Higher = better accuracy but slower |
| `config` | `string` | `--psm 6` | Tesseract configuration string |

#### Example 1: Transform a PDF
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": [
    { "uri": "http://www.fancy_website.com/cool.pdf" }
  ]
}
```

#### Example 2: Transform an image
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": [
    { "uri": "gs://pictures_of_dogs/corgi.png" }
  ]
}
```

#### Example 3: Transform and save a Word doc
```json
{
  "ad_object_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": [
    { "uri": "gs://documents/some_doc.docx" }
  ],
  "save_transformed_content": true
}
```

---

### GET `/services/transform/retrieve` -- Get metadata of saved transforms

Get IDs and metadata of previously transformed and saved content.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `user_id` | `string` (UUID) | No | The user whose transformed content will be retrieved |

---

### POST `/services/transform/retrieve` -- Retrieve saved transformed content

Retrieve previously transformed and saved content by IDs.

**Request Body** (`application/json`) -- Schema: `RetrieveSavedContentRequest`

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `ad_object_id` | `string` | No | Active Directory ID of caller |
| `debug` | `boolean` | No | Default `false` |
| `saved_content_id` | `string[]` | No | IDs of saved post-transform content (1-10 items) |

---

## 5. Feedback

> Provide feedback to the AI Hub team

### POST `/feedback` -- Submit feedback

Submit feedback to be reviewed by the AI Hub team.

**Request Body** (`application/json`) -- Schema: `GeneralFeedbackRequest`

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `title` | `string` | Yes | Title of the feedback request/issue |
| `details` | `string` | Yes | Free-text field for details about the issue/feedback |
| `ad_object_id` | `string` | Yes | Active Directory ID of caller |
| `debug` | `boolean` | No | Default `false` |
| `model` | `string[]` | No | Specific model(s) the feedback is about |

**Responses:** `200` Feedback submitted | `400` Malformed | `500` Exception

---

## 6. Cache

> API service cache management

### POST `/cache/flush` -- Flush user info from cache

Flush a user's info or all users' info from the cache.

**Request Body** (`application/json`) -- Schema: `CacheFlushRequest`

Two modes (oneOf):
1. Flush for a specific user: requires `ad_object_id` + `user_id`
2. Flush all: requires `ad_object_id` + `all`

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `ad_object_id` | `string` | Yes | Active Directory ID of caller |
| `user_id` | `string` | Conditional | Target user to flush data for (required if not using `all`) |
| `all` | `boolean` | Conditional | Flush all data from cache (only functions if `user_id` is empty) |
| `debug` | `boolean` | No | Default `false` |

**Responses:** `200` Flushed | `400` Malformed | `500` Exception (cache may or may not have been flushed)

---

## Schemas Reference (Additional)

### ExecuteAgentRequest

Used for agent execution (not directly exposed as a top-level endpoint in current docs but exists as a schema).

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `ad_object_id` | `string` | No | Active Directory ID of caller |
| `agent_id` | `string` | No | ID of the agent to execute |
| `prompt` | `string` | No | Base64 encoded prompt to execute |
| `debug` | `boolean` | No | Default `false` |
| `agent_context` | `null` or `object` | No | For `gcp_search_once`: null. For `gcp_search_multiturn`: object with `conversation` (string) field |

### ModelResponse

Response schema for model metadata queries.

| Field | Type | Description |
|-------|------|-------------|
| `data` | `object` | Map of model objects keyed by model ID |
| `data[model].id` | `string` | Model ID |
| `data[model].name` | `string` | Model name |
| `data[model].display_name` | `string` | Display name |
| `data[model].description` | `string` | Model description |
| `data[model].input_tokens` | `integer` | Max input tokens |
| `data[model].output_tokens` | `integer` | Max output tokens |
| `data[model].api_metadata` | `object` | API pathway settings: `codepath`, `image_support`, `model_name_with_version`, `multimedia_support` |
| `data[model].ui_metadata` | `object` | UI properties: `category`, `developer`, `documentUpload`, `image`, `supportedSettings[]` |
| `debug` | `object` | Debugging information & telemetry |
| `error` | `string[]` | Error messages |
| `has_error` | `boolean` | Error flag |
| `id` | `string` (UUID) | Unique Request ID |
| `processing_time_ms` | `number` | Processing time |

---

## Quick Reference: Common Patterns

### Base64 Encoding

All text inputs (`prompt`, `context`, `input_text`, `previous_messages[].content`) must be Base64 encoded:

```python
import base64
encoded = base64.b64encode("Your prompt here".encode()).decode()
```

```javascript
const encoded = btoa("Your prompt here");
```

### Multi-Model Async Execution

When you specify multiple models in the `models` array, they are called asynchronously. The response will contain one entry per model in `data.generative_responses[]`, identifiable by the `service_name` field.

### Task + Execute Workflow

1. Create a Task via `POST /task` with system instructions in `context`
2. Get the task ID from the response or via `GET /task`
3. Execute it via `POST /task/execute` with the `task_id`, your `prompt`, and desired `models`

### RAG (Retrieval-Augmented Generation) Workflow

1. Create a corpus via `POST /corpus`
2. Import documents via `POST /corpus/import`
3. Query with retrieval only: `POST /corpus/retrieval`
4. Query with retrieval + generation: `POST /corpus/retrieval/generative` (Gemini models only)

### Content Transformation Workflow

1. Transform content via `POST /services/transform` with `save_transformed_content: true`
2. Get saved content metadata via `GET /services/transform/retrieve`
3. Retrieve saved content via `POST /services/transform/retrieve`
4. Optionally associate saved content UUIDs with Tasks as `references`
