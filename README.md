---
title: 'Documentação da atividade de qualita'
disqus: hackmd
---

Deploy de 2048
===
Todos os passos eu segui como no vídeo indicado: https://www.youtube.com/watch?v=FBl1gZzcESY
Usei o terminal linux

## Sumário

[TOC]

## Instalando o nginx

1. Atualizando os pacotes da máquina
```
    sudo apt update
```
2. Instalando o nginx
```
    sudo apt install nginx
```

## Configuração do firewall ufw
1. Verificando os apps disponíveis para o ufw
```
    sudo ufw app list
```

> Saída esperada
>```=
>Aplicativos disponíveis:
>  CUPS
>  Nginx Full
>  Nginx HTTP
>  Nginx HTTPS
>```

2. Permitindo HTTP do Nginx:
```
    sudo ufw allow ‘Nginx HTTP’
```
> Saída esperada
>```=
>Regras atualizadas
>Regras atualizadas (v6)
>```

3. Verificando status do ufw
```
    sudo ufw status
```

- O meu ufw não estava previamente habilitado, pois a saída do comando acima foi:
> Saída do comando
>```=
>Estado: inativo
>```
- Então, pesquisei e achei o seguinte site: https://www.vivaolinux.com.br/topico/netfilter-iptables/ufw-inativo#google_vignette
- Dei o comando indicado no site para ativar o firewall ufw:
```
    sudo ufw enable
```
- E assim apareceu essa saída:
> Saída do comando:
> ```=
> Firewall está ativo e habilitado na inicialização do sistema

- Para confirmar, executei o seguinte comando novamente:
```
    sudo ufw status
```
- Que resultou na saída experada:

> Saída esperada
>```=
>Estado: ativo
>
>Para                       Ação        De
>----                       ----        --
>Nginx HTTP                 ALLOW       Anywhere
>Nginx HTTP (v6)            ALLOW       Anywhere (v6)
>```

## Verificando o servidor e o IP da máquina na rede interna

1. Verificando o servidor
```
    systemclt status nginx
```
> Trecho da saída esperada:
> ```=
>Active: active (running) since Sat 2026-03-28 17:58:44 -03; 11min ago
>```

2. Verificando o IP da máquina na rede interna:
```
    ip addr show
```
> Trecho da saída esperada:
> ```=
> inet 192.168.68.117/24 brd 192.168.68.255 scope global dynamic noprefixroute wlp2s0
>```

- Para verificar, acesse http://enderecoip em um navegador, lá deve aparecer o site do nginx
- Exemplo do endereço da minha máquina: http://192.168.68.117/

## Iniciando o deploy
1. Entre na pasta html, onde ficam os arquivos do site, com o seguinte comando:
```
    cd /var/www/html
```
- Verifique se o arquivo do site de boas-vindas do nginx está lá, com o seguinte comando:
```
    ls
```
>Saída esperada:
>```=
>index.nginx-debian.html
>```

2. Verifique onde estão os arquivos que você deseja fazer o deploy.
- Eu extraí a pasta 2048-master na pasta Documentos no meu computador.

3. Execute o comando para copiar os arquivos a serem feitos deploy com o seguinte comando:
```
    sudo cp -r endereco/de/origem .
```
>- Exemplo da minha máquina:
>```
>sudo cp -r /home/taynara/Documentos/2048-master/* .
>```

## E pronto!
Com isso o arquivo html pode ser acessado localmente na sua máquina!

## Resultado final

O jogo 2048 foi executado na minha máquina pelo deploy com sucesso.
![Captura de tela de 2026-03-28 20-00-19](https://hackmd.io/_uploads/S1qca0roZg.png)


