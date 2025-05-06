<?php

namespace App\Http\Resources;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

class ApiResponse
{
    /**
     * Create a success response.
     *
     * @param  mixed  $data
     * @param  string  $message
     * @param  int  $code
     * @return \Illuminate\Http\JsonResponse
     */
    public static function success($data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message
        ];

        if ($data) {
            $response['data'] = $data instanceof JsonResource ? $data : (array) $data;
        }

        return response()->json($response, $code);
    }

    /**
     * Create an error response.
     *
     * @param  string  $message
     * @param  int  $code
     * @param  array  $errors
     * @return \Illuminate\Http\JsonResponse
     */
    public static function error(string $message, int $code = 400, array $errors = []): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Create a response for validation errors.
     *
     * @param  array  $errors
     * @param  string  $message
     * @return \Illuminate\Http\JsonResponse
     */
    public static function validationError(array $errors, string $message = 'Validation failed'): JsonResponse
    {
        return static::error($message, 422, $errors);
    }

    /**
     * Create an unauthorized response.
     *
     * @param  string  $message
     * @return \Illuminate\Http\JsonResponse
     */
    public static function unauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return static::error($message, 401);
    }

    /**
     * Create a forbidden response.
     *
     * @param  string  $message
     * @return \Illuminate\Http\JsonResponse
     */
    public static function forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return static::error($message, 403);
    }

    /**
     * Create a not found response.
     *
     * @param  string  $message
     * @return \Illuminate\Http\JsonResponse
     */
    public static function notFound(string $message = 'Resource not found'): JsonResponse
    {
        return static::error($message, 404);
    }

    /**
     * Create a server error response.
     *
     * @param  string  $message
     * @param  array  $errors
     * @return \Illuminate\Http\JsonResponse
     */
    public static function serverError(string $message = 'Server Error', array $errors = []): JsonResponse
    {
        return static::error($message, 500, $errors);
    }
}