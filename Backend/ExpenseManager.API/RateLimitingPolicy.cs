using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace ExpenseManager.API;

/// <summary>
/// Configures rate limiting policies for the API.
/// </summary>
public static class RateLimitingPolicy
{
    /// <summary>
    /// Configure rate limiting policies.
    /// </summary>
    private const string PartitionKey = "unknown";
    public static void AddRateLimitingPolicies(this WebApplicationBuilder builder)
    {
        builder.Services.AddRateLimiter(options =>
        {
            // Global default policy - sliding window with 100 requests per minute per IP
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                RateLimitPartition.GetSlidingWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? PartitionKey,
                    factory: partition => new SlidingWindowRateLimiterOptions
                    {
                        PermitLimit = 100,
                        Window = TimeSpan.FromMinutes(1),
                        SegmentsPerWindow = 4
                    }));

            // Rate limit exceeded response
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            // Optional: Configure specific policies for different endpoints
            // Strict policy: 20 requests per minute (for sensitive operations like auth)
            options.AddPolicy("strict", context =>
                RateLimitPartition.GetSlidingWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? PartitionKey,
                    factory: partition => new SlidingWindowRateLimiterOptions
                    {
                        PermitLimit = 20,
                        Window = TimeSpan.FromMinutes(1),
                        SegmentsPerWindow = 4
                    }));

            // Relaxed policy: 300 requests per minute (for high-traffic endpoints)
            options.AddPolicy("relaxed", context =>
                RateLimitPartition.GetSlidingWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? PartitionKey,
                    factory: partition => new SlidingWindowRateLimiterOptions
                    {
                        PermitLimit = 300,
                        Window = TimeSpan.FromMinutes(1),
                        SegmentsPerWindow = 4
                    }));

            // Auth policy: 10 requests per minute (prevent brute force attacks)
            options.AddPolicy("auth", context =>
                RateLimitPartition.GetSlidingWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? PartitionKey,
                    factory: partition => new SlidingWindowRateLimiterOptions
                    {
                        PermitLimit = 10,
                        Window = TimeSpan.FromMinutes(1),
                        SegmentsPerWindow = 4
                    }));
        });
    }
}
