# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.245.2/containers/ruby/.devcontainer/base.Dockerfile

ARG VARIANT="3.4-bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/ruby:${VARIANT}

ARG NODE_VERSION="22"
RUN su vscode -c "source /usr/local/share/nvm/nvm.sh && nvm install ${NODE_VERSION} 2>&1"

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    make

# [Optional] Uncomment this line to install additional gems.
# RUN gem install <your-gem-names-here>
