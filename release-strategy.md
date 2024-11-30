# Estratégia de Releases

Este documento define como as releases serão gerenciadas ao longo do ciclo de vida do projeto, incluindo a convenção de versionamento e o uso de tags.

## 1. Convenção de Versionamento
- Usaremos a convenção **SemVer** para todas as versões do projeto:
  - **MAJOR**: Mudanças incompatíveis na API.
  - **MINOR**: Funcionalidades adicionadas de maneira compatível com versões anteriores.
  - **PATCH**: Correções de bugs que não afetam a compatibilidade.

Exemplo:  
- `v1.0.0`: Primeira versão estável.
- `v1.1.0`: Adiciona uma nova funcionalidade sem quebrar a compatibilidade.
- `v1.0.1`: Corrige bugs na versão 1.0.0.

## 2. Fluxo de Releases
- **Branches**:
  - `main`: Contém a versão estável para produção.
  - `develop`: Contém as mudanças de desenvolvimento ativas.
  - `feature/*`: Para novas funcionalidades.
  - `hotfix/*`: Para correções rápidas de produção.

## 3. Tags e Releases
- As tags serão criadas com base nas versões semânticas e associadas a um novo release.
- Quando uma nova versão está pronta, será criada uma tag correspondente, por exemplo, `v1.0.0`.
- **Releases** serão criadas no GitHub usando essas tags para disponibilizar novas versões.

## 4. Frequência de Releases
- Releases principais serão feitas após a conclusão de um conjunto de funcionalidades ou correções importantes.
- Hotfixes serão lançados imediatamente após a correção de um bug crítico.

## 5. Gerenciamento de Versões
- A versão estável (`main`) será atualizada com cada release
