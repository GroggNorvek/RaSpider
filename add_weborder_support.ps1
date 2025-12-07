# Script para añadir soporte de WebOrder al NavMesh

# 1. Añadir métodos al final de navmesh.js (antes del cierre de la clase)
$navmeshContent = Get-Content 'navmesh.js' -Raw

# Encontrar el final de la clase NavMesh (antes del último })
$insertPosition = $navmeshContent.LastIndexOf('}')

$newMethods = @"

    /**
     * Añadir sitio de construcción temporal para WebOrder pending
     */
    addTemporaryConstructionSite(order) {
        if (!order.id) {
            order.id = `"order_`${Date.now()}_`${Math.random()}`";
        }

        const tempNodes = [];

        // Crear nodos temporales en nearPoint y farPoint
        for (const point of [order.startPoint, order.endPoint]) {
            const x = Math.round(point.x / this.nodeSpacing) * this.nodeSpacing;
            const y = Math.round(point.y / this.nodeSpacing) * this.nodeSpacing;

            let node = this.nodeGrid[```${x},```${y}``];
            if (!node) {
                node = new NavNode(x, y);
                this.nodes.push(node);
                this.nodeGrid[```${x},```${y}``] = node;
            }

            if (!node.walkable) {
                node.walkable = true;
                this.walkableNodes.push(node);
            }
            node.surface = 'construction';
            node.surfaceRef = order;
            tempNodes.push(node);
        }

        // Guardar referencia para limpieza posterior
        if (!this.constructionSites) {
            this.constructionSites = new Map();
        }
        this.constructionSites.set(order.id, tempNodes);

        // Conectar nodos temporales
        this.rebuildConnectionsForNodes(tempNodes);

        console.log(```🚧 Sitio de construcción temporal añadido para orden ```${order.id}``);
    }

    /**
     * Remover sitio de construcción temporal cuando web se completa
     */
    removeTemporaryConstructionSite(order) {
        if (!this.constructionSites || !order.id) return;

        const tempNodes = this.constructionSites.get(order.id);
        if (tempNodes) {
            for (const node of tempNodes) {
                if (node.surface === 'construction' && node.surfaceRef === order) {
                    const onOtherSurface = this.isOnTrunk(node.x, node.y) || 
                                          this.findBranchAt(node.x, node.y) ||
                                          (this.nest && this.isInNest(node.x, node.y));
                    
                    if (!onOtherSurface) {
                        node.walkable = false;
                        const index = this.walkableNodes.indexOf(node);
                        if (index > -1) {
                            this.walkableNodes.splice(index, 1);
                        }
                    }
                    
                    node.surface = null;
                    node.surfaceRef = null;
                    node.neighbors = [];
                }
            }

            this.constructionSites.delete(order.id);
            console.log(```✅ Sitio de construcción temporal removido para orden ```${order.id}``);
        }
    }
"@

$navmeshContent = $navmeshContent.Insert($insertPosition, $newMethods)
$navmeshContent | Set-Content 'navmesh.js' -Encoding UTF8

Write-Host "✅ Métodos añadidos a navmesh.js"

# 2. Modificar web.js - añadir llamada en createOrder
$webContent = Get-Content 'web.js' -Raw
$webContent = $webContent -replace '(\s+this\.orders\.push\(order\);)', '$1`r`n`r`n        // Añadir construcción temporal al NavMesh`r`n        if (this.navMesh) {`r`n            this.navMesh.addTemporaryConstructionSite(order);`r`n        }'

# Modificar completeOrder para limpiar temp y añadir web
$webContent = $webContent -replace '(order\.status = ''complete'';[\r\n\s]+)(// Elim)', '$1// Limpiar sitio temporal y añadir web real al NavMesh`r`n        if (this.navMesh) {`r`n            this.navMesh.removeTemporaryConstructionSite(order);`r`n        }`r`n`r`n        $2'

$webContent | Set-Content 'web.js' -Encoding UTF8

Write-Host "✅ Modificaciones aplicadas a web.js"

Write-Host "`n🎉 Script completado! Recarga el navegador para probar"
