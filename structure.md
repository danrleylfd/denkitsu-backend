### Estrutura de pastas do projeto Denkitsu
```
├── ./src/
│  ├── app.js
│  ├── app/
│  │  ├── controllers/
│  │  │  ├── access.js
│  │  │  ├── account.js
│  │  │  ├── auth.js
│  │  │  ├── comment.js
│  │  │  ├── dashboard.js
│  │  │  ├── external.js
│  │  │  ├── index.js
│  │  │  ├── like.js
│  │  │  ├── linker.js
│  │  │  ├── message.js
│  │  │  ├── reply.js
│  │  │  ├── share.js
│  │  │  └── video.js
│  │  ├── middlewares/
│  │  │  ├── auth.js
│  │  │  ├── cors.js
│  │  │  ├── log.js
│  │  │  ├── owner.js
│  │  │  ├── rateLimiter.js
│  │  │  ├── reply.js
│  │  │  └── video.js
│  │  ├── models/
│  │  │  ├── auth.js
│  │  │  ├── comment.js
│  │  │  ├── linker.js
│  │  │  ├── log.js
│  │  │  └── video.js
│  │  └── views/
│  │     ├── account/
│  │     │  ├── deleteAccount.js
│  │     │  ├── editAccount.js
│  │     │  └── getUser.js
│  │     ├── auth/
│  │     │  ├── forgotPassword.js
│  │     │  ├── refreshToken.js
│  │     │  ├── resetPassword.js
│  │     │  ├── signIn.js
│  │     │  └── signUp.js
│  │     ├── dashboard/
│  │     │  └── readLogs.js
│  │     ├── external/
│  │     │  └── index.js
│  │     ├── linker/
│  │     │  ├── createOne.js
│  │     │  ├── deleteOne.js
│  │     │  ├── readMany.js
│  │     │  ├── readOne.js
│  │     │  └── updateOne.js
│  │     ├── message/
│  │     │  └── sendMessage.js
│  │     └── video/
│  │        ├── comments/
│  │        │  ├── addComment.js
│  │        │  ├── countComment.js
│  │        │  ├── delComment.js
│  │        │  ├── delReply.js
│  │        │  ├── replyComment.js
│  │        ├── likes/
│  │        │  ├── addLike.js
│  │        │  ├── countLike.js
│  │        │  └── delLike.js
│  │        ├── shares/
│  │        │  ├── countShare.js
│  │        │  └── share.js
│  │        ├── createOne.js
│  │        ├── deleteOne.js
│  │        ├── readOne.js
│  │        ├── readPopular.js
│  │        ├── readRecents.js
│  │        └── updateOne.js
│  └── utils/
│      ├── aiModels.js
│      ├── database/
|      |  └── index.js
│      ├── services/
|      |  |── ai
|      |  |   └── index.js
|      |  |── auth
|      |  |   └── index.js
|      |  |── mail
|      |  |   └── index.js
|      |  └── kwai
|      |      └── index.js
│      └── templates/
|         └── forgotPassword.ejs
├── .env
└── package.json
```
