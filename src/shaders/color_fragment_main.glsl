// float r = 0.5 * (sin(vPosition.x + uTime / 2.0) + 1.0);
// float g = 0.5 * (sin(vPosition.y + uTime / 2.0) + 1.0);
// float b = 0.5 * (sin(vPosition.z + uTime / 2.0) + 1.0);
// vec3 color = vec3(r, g, b);
// diffuseColor = vec4(color, 1.0);

vec2 uv = vUv * 2.0 - 1.0;
vec2 uv0 = uv;
vec3 finalColor = vec3(0.0);

for (float i = 0.0; i < 3.0; i++) {
    uv = fract(uv * 1.5) - 0.5;
    float d = length(uv) * exp(-length(uv0));
    vec3 col = palette(length(uv0) + uTime * 0.4);
    d = sin(d * 8.0 + uTime) / 8.0;
    d = abs(d);
    d = 0.02 / d;
    finalColor += col * d;
}

diffuseColor = vec4(finalColor, 1.0);