# AbiturientStat

## Development

Install and run application:

```bash
bundle install
RACK_ENV=development bundle ex thin start
```

Use `public` folder for static files. You can access `public/hello.html` by `http://localhost:3000/hello.html` url.

Define actions in `backend/application.rb` file. Use namespace `backend` for them: `http://localhost:3000/backend`.
