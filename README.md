# CRUD - SOA

## Integrantes
- Daniel Santiago Varela
- Tomas de Andreis
- Juan León
- Andres Ricardo Rey Agudelo

### Lanzamiento base de datos

```shell
sudo docker compose build
sudo docker compose up
```

Ubicado en la carpeta raiz:

### Lanzamiento API Gateway

```shell
fastapi run --port 8000
```

### Lanzamiento CREATE servicecreate

```shell
fastapi run --port 8001 services/create/main.py
```

### Lanzamiento READ service

```shell
fastapi run --port 8002 services/read/main.py
```

### Lanzamiento UPDATE service

```shell
fastapi run --port 8003 services/update/main.py
```

### Lanzamiento DELETE service

```shell
fastapi run --port 8004 services/delete/main.py
```

### Pruebas desde ```localhost:8000/docs```