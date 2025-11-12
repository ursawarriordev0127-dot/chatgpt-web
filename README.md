<div align="center">
<img src="./src/assets/openai.svg" style="width:64px;height:64px;margin:0 32px" alt="icon"/>

<h1 align="center">ChatGPT Web</h1>

A commercially-viable ChatGpt web application built with React.

A deployable commercial ChatGpt web application.

[Issues](https://github.com/79E/ChatGPT-Web/issues) / [Buy Me a Coffee](https://www.buymeacoffee.com/beggar) / [Sponsor Me](https://files.catbox.moe/o0znrg.JPG)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/79E/ChatGpt-Web)

</div>

## Communication & Sponsorship
<a href='https://t.me/+zMADkTgyzWMyYTk1' target='_blank'>
<img width='46%' style="border-radius: 12px;" src='https://files.catbox.moe/o0znrg.JPG' />
</a>
<a href='https://t.me/+zMADkTgyzWMyYTk1' target='_blank'>
<img width='46%' style="border-radius: 12px;" src='https://www.helloimg.com/images/2023/06/20/otDPwM.png' />
</a>


## 🐶 Demo
### Page Links

[Web Demo: https://www.aizj.top/](https://www.aizj.top/)

```
Demo URL: https://www.aizj.top
Admin URL: https://www.aizj.top/admin
Admin Account: admin@c.om
Admin Password: admin123
```

If you need help, please submit [Issues](https://github.com/79E/ChatGPT-Web/issues) or leave your contact information when sponsoring.

### Screenshots

![cover](https://files.catbox.moe/tp963e.png)
![cover](https://files.catbox.moe/y5avbx.png)
![cover](https://files.catbox.moe/k16jsz.png)
![cover](https://files.catbox.moe/8o5oja.png)

## 🤖 Main Features

- Admin management system for managing users, tokens, products, activation codes, etc.
- Carefully designed UI with responsive design
- Extremely fast first screen loading speed (~100kb)
- Support for Midjourney drawing and DALL·E model drawing, GPT4 and other applications
- Massive built-in prompt list from [Chinese](https://github.com/PlexPt/awesome-chatgpt-prompts-zh) and [English](https://github.com/f/awesome-chatgpt-prompts)
- One-click export chat records with full Markdown support
- Support for custom API addresses (e.g., [openAI](https://api.openai.com) / [API2D](https://api2d.com/r/192767))

## 🎮 Getting Started
**Node Environment**

`node` requires `^16 || ^18 || ^19` version (node >= 16.19.0), you can use nvm to manage multiple local node versions.

```
# Check node version
node -v

# Check npm version
npm -v

# Check yarn version
yarn -v

```

**1. First `Fork` this project, then clone it locally.**
```
git clone https://github.com/79E/ChatGpt-Web.git
```

**2. Install dependencies**
```
yarn install
```

**3. Run**
```
# Start web project
yarn dev:web
```

**4. Build**
```
yarn build
```

## ⛺️ Environment Variables

> If deploying the project in frontend-backend separation mode, you need to fill in the following configuration

#### `VITE_APP_REQUEST_HOST` 

The `Host` address of the request server.

## 🚧 Development

> It is strongly not recommended to develop or deploy locally. Due to some technical reasons, it is difficult to configure the OpenAI API proxy locally, unless you can guarantee a direct connection to the OpenAI server.

#### Local Development

1. Install nodejs and yarn. For specific details, please ask ChatGPT
2. Execute `yarn install`
3. Web project development `yarn dev:web`
4. Server project development `yarn dev`
5. Build project `yarn build`

#### Server

1. Frontend requests to the server [API Documentation](https://console-docs.apipost.cn/preview/38826c52f656ef05/044846bd536b67bb) You can develop according to this API documentation
2. Import the MySQL SQL file into the database
3. Configure the database connection information (server/config)
3. If you need help, please submit [Issues](https://github.com/79E/ChatGPT-Web/issues) or leave your contact information when sponsoring.

## 🎯 Deployment
> Simply upload the packaged `dist` directory of the `WEB` project to the server. Pay attention to the server IP address location!

### Vercel
If you host it on your own Vercel server, you can click the deploy button to start your deployment!

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/79E/ChatGpt-Web)

If you need help, please submit [Issues](https://github.com/79E/ChatGPT-Web/issues) or leave your contact information when sponsoring.


## 🧘 Contributors

[See project contributors list](https://github.com/79E/ChatGPT-Web/graphs/contributors)

## 📋 Open Source License

[![License MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/79E/ChatGpt-Web/blob/master/license)
