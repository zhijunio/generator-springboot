package <%= packageName %>.model.response;

public record LoginResponse(
        String token,
        String username
) {
}
