float r = 0.5 * (sin(vPosition.x + uTime / 2.0) + 1.0);
float g = 0.5 * (sin(vPosition.y + uTime / 2.0) + 1.0);
float b = 0.5 * (sin(vPosition.z + uTime / 2.0) + 1.0);
vec3 color = vec3(r, g, b);
diffuseColor = vec4(color, 1.0);