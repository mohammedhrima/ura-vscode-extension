NODE      ?= node
NAME      := $(shell $(NODE) -p "require('./package.json').name")
VERSION   := $(shell $(NODE) -p "require('./package.json').version")
VSIX      := $(NAME)-$(VERSION).vsix
SRC       := $(wildcard src/*.ts)
ASSETS    := $(wildcard syntaxes/*.json) $(wildcard icons/*)
CONFIGS   := language-configuration.json anvil-language-configuration.json

.PHONY: build package install clean

build: out/extension.js

node_modules: package.json
	npm install
	@touch node_modules

out/extension.js: $(SRC) tsconfig.json node_modules
	npx tsc --noEmit false

$(VSIX): out/extension.js package.json $(ASSETS) $(CONFIGS)
	@rm -f *.vsix
	npx vsce package

package: $(VSIX)

install: $(VSIX)
	code --install-extension $(VSIX) --force

clean:
	rm -rf out *.vsix