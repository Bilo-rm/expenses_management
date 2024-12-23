local cjson = require "cjson"
local jwt = require "resty.jwt"

-- Secret key used to sign JWTs
local secret = "Hr9MwwFT32"

-- Extract the token from the Authorization header
local headers = ngx.req.get_headers()
local auth_header = headers["Authorization"]

if not auth_header then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say(cjson.encode({ message = "Missing Authorization header" }))
    ngx.log(ngx.ERR, "Authorization header is missing")
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

local _, _, token = string.find(auth_header, "Bearer%s+(.+)")
if not token then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say(cjson.encode({ message = "Invalid Authorization header format" }))
    ngx.log(ngx.ERR, "Invalid Authorization header format")
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

-- Verify the JWT
local jwt_obj = jwt:verify(secret, token)

if not jwt_obj.verified then  -- fixed: use .verified instead of ["verified"]
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say(cjson.encode({ message = "Invalid or expired token" }))
    ngx.log(ngx.ERR, "JWT verification failed")
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

-- Token is valid, proceed to the backend service
ngx.req.set_header("X-User-ID", jwt_obj.payload.user_id)  -- fixed: access the payload correctly
