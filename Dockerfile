FROM openresty/openresty:latest

# Install required Lua modules
RUN opm get SkyLothar/lua-resty-jwt
RUN opm get bungle/lua-resty-template

# Copy Nginx configuration and Lua scripts
COPY nginx.conf /etc/nginx/nginx.conf
COPY lua /usr/local/openresty/nginx/lua
