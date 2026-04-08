
```sh
npm install
npm install pinia
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

# Plataforma de Organização de Resumos

Uma aplicação web desenvolvida com **Vue.js 3** para auxiliar estudantes no upload, organização e gerenciamento de resumos acadêmicos.

---

## Arquitetura do Projeto

O projeto utiliza uma abordagem **Layer-Based** (Baseada em Camadas), garantindo que a lógica de negócio, a comunicação com APIs e a interface do usuário estejam devidamente desacopladas.

### Estrutura de Pastas (`/src`)

- **`assets/`**: Recursos estáticos como imagens, ícones e arquivos CSS globais.
- **`components/`**: Componentes de UI reutilizáveis (Componentes "Burros").
  - `common/`: Átomos da interface (Ex: `BaseButton.vue`, `BaseInput.vue`).
  - `layout/`: Componentes estruturais (Ex: `TheNavbar.vue`, `TheSidebar.vue`).
- **`pages/`**: Componentes de página vinculados ao Vue Router (Componentes "Inteligentes").
- **`hooks/`**: (Composables) Lógica reativa encapsulada e reutilizável (Ex: `useFileUpload.js`).
- **`services/`**: Camada de infraestrutura e comunicação HTTP (Axios/Fetch).
- **`store/`**: Gerenciamento de estado global da aplicação (Pinia).
- **`utils/`**: Funções utilitárias puras e ajudantes (Ex: `formatDate.js`).

---

## Convenções de Nomenclatura

Para garantir a consistência e a escalabilidade, seguimos rigorosamente as seguintes convenções:

| Tipo | Padrão | Exemplo |
| :--- | :--- | :--- |
| **Componentes (.vue)** | `PascalCase` | `SummaryCard.vue` |
| **Pastas** | `kebab-case` | `student-dashboard/` |
| **Hooks / Composables** | `camelCase` (prefixo use) | `useAuth.js` |
| **Serviços / Utils** | `camelCase` | `apiService.js` |
| **Template HTML** | `kebab-case` | `<base-button />` |
| **Variáveis de Env** | `UPPER_SNAKE_CASE` | `VITE_API_URL` |

> **Nota:** Todos os componentes devem ter nomes com **múltiplas palavras** (Ex: `SummaryItem.vue` em vez de `Item.vue`) para evitar conflitos com a especificação HTML.

---

## Configurações de Ambiente

O projeto utiliza caminhos curtos (**Path Aliases**) para facilitar as importações. Use o prefixo `@/` para referenciar a pasta `src`.


## Por que esta Arquitetura?

A estrutura deste projeto foi planejada seguindo os princípios de **Clean Architecture** e as recomendações oficiais do **Vue.js 3**, focando em três pilares:

### 1. Separação de Responsabilidades (SoC)
Ao contrário do padrão inicial do Vite, aqui isolamos a lógica de negócio da interface.
* **Services:** Cuidam apenas da comunicação com o servidor (Axios).
* **Hooks (Composables):** Gerenciam o estado reativo e as regras de negócio.
* **Components:** Focam exclusivamente na apresentação (UI).
* **routes/:** Configuração central do Vue Router, mapeando URLs para componentes da pasta **pages/**.

### 2. Lógica Portátil e Reutilizável
Através do uso de **Composables** (pasta `hooks/`), a lógica de funcionalidades complexas (como o upload de resumos ou autenticação) é extraída dos componentes. Isso permite que a mesma lógica seja utilizada em diferentes partes da aplicação sem duplicação de código.

### 3. Facilidade de Manutenção e Testes
Pastas como `utils/` e `services/` contêm código JavaScript puro. Isso facilita a escrita de testes unitários e garante que, se precisarmos alterar a URL de uma API ou a forma como uma data é formatada, faremos isso em um único arquivo centralizado, refletindo em todo o sistema.

### 4. Escalabilidade Acadêmica
Mesmo sendo um projeto de pequeno porte, essa organização permite que novas funcionalidades (como grupos de estudo, comentários ou avaliações) sejam adicionadas sem gerar dívida técnica ou desorganização no diretório `src/`.


### Arquitetura de Roteamento
A arquitetura de roteamento foi implementada utilizando Code Splitting (Lazy Loading), garantindo que a aplicação carregue apenas os módulos necessários por demanda. Utilizamos Path Aliases para maior manutenibilidade e centralizamos a configuração em um módulo isolado, permitindo a futura implementação de Navigation Guards para proteção de rotas privadas."

### Proteção de Rotas (Navigation Guards)
Implementamos um sistema de proteção de rotas utilizando o meta: { requiresAuth: true }. O roteador intercepta cada navegação e verifica a presença de um token de autenticação. Caso um usuário não autenticado tente acessar áreas restritas (como Dashboard ou Upload), ele é automaticamente redirecionado para a tela de Login.

### Camada de API (Axios Interceptors)
A comunicação com o backend é centralizada no `src/services/api.js`. 
- **Injeção de Token:** Utilizamos interceptores para anexar automaticamente o token JWT (armazenado no Pinia) em todas as requisições.
- **Tratamento Global:** Erros de autenticação (Status 401) são tratados globalmente, forçando o logout e o redirecionamento do estudante caso a sessão expire.