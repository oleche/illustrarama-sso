db.createUser(
  {
    user:"admin",
    pwd:"admin123456",
    roles:[
      {
        role:"readWrite",
        db:"illustrarama-db"
      }
    ]
  }
)

db.createCollection("oauthclients")

db.createCollection("oauthusers")

db.oauthclients.insertOne({clientId: "8879A0CA6BDE11A8F9619E548BE5E2F8E03F6FED", clientSecret: "5E6D784AED4B1040C01748CFD8E8D24BDF9B1007", redirectUris: "https://www.illustrarama.com", grants: ["client_credentials", "password", "refresh_token"]})

db.oauthusers.insertOne({ email: "oleche@geekcowsd.com", firstname: "administrator", lastname: "illustrarama", password: "11E04E0618832BDC827287DE3D82B0430E5E4E24", username: "administrator", role: "admin" })

db.oauthusers.insertOne({ email: "info@geekcowsd.com", firstname: "illustrarama", lastname: "site", password: "F1CE8351D3531EE426035F2172F21EEFC70C52D2", username: "illustrarama-site", role: "application", clientId: "8879A0CA6BDE11A8F9619E548BE5E2F8E03F6FED" })
