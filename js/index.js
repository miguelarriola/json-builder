const NAME_HEADER = 'name'
const TYPE_HEADER = 'type'
const VALUE_HEADER = 'value'
const KEY_SEPARATOR = '.'
const OBJECT_TYPE = 'object'
const STRING_TYPE = 'string'
const NUMBER_TYPE = 'number'
const ARRAY_REGEX = /\[\]$/
const EMPTY_STR = ''

function toJson(table) {
    const fields = getFields(table)
    const object = buildObject(fields)
    return JSON.stringify(object, null, 4)
}

function getFields(matrix) {
    const fields = []
    matrix.forEach((row, y) => {
        if (y !== 0) {
            const field = {}
            row.forEach((cell, x) => {
                switch (matrix[0][x]) {
                    case VALUE_HEADER:
                        field.value = cell
                        break
                    case TYPE_HEADER:
                        field.type = cell
                        break
                    case NAME_HEADER:
                    default:
                        field.type = cell
                        field.path = cell.split(KEY_SEPARATOR)
                        break
                }
            })
            fields.push(field)
        }
    })
    return fields
}

function buildObject(fields) {
    const FIRST_LEVEL = 0
    let objectRoot = {}
    let arrayNodes = []
    fields.forEach(
        field => (objectRoot = getTree(FIRST_LEVEL, objectRoot, arrayNodes, field))
    )
    return objectRoot
}

function getTree(level, root, nodes, field) {
    const {key, isArray} = getKey(field.path[level])
    if (level === field.path.length - 1) {
        root[key] = getValue(field)
    } else if (!isArray) {
        root[key] = getTree(level + 1, initRoot(root[key]), nodes, field)
    } else {
        if (!Array.isArray(root[key])) {
            root[key] = []
        }
        const index = getItem(root, key, getKey(field.path[level + 1]).key)
        root[key][index] = initRoot(root[key][index])
        root[key][index] = getTree(level + 1, root[key][index], nodes, field)
        // const node = getNode(key, field.name, root, nodes);
        // nodes.push(node)
    }
    return root
}

function getItem(root, key, nextKey) {
    let index = 0
    while (root[key][index] !== undefined) {
        if (root[key][index][nextKey] === undefined) {
            return index
        }
        ++index
    }
    // do {
    //     root[key][index] = initRoot(root[key][index])
    //     ++index
    // } while (root[key][index] !== undefined)
    return index
}

function initRoot(root) {
    if (root === undefined ||
        root === null ||
        typeof root !== 'object' ||
        Array.isArray(root)) {
        return {}
    } else {
        return root
    }
}

function getKey(key) {
    const isArray = ARRAY_REGEX.test(key)
    return {isArray, key: key.replace(ARRAY_REGEX, EMPTY_STR)}
}

// TODO primero sacar el parentArray que corresponde al padre arreglo que
//   todos los nodos tienen en comun, p. e.: root[key][index] = {}
//  hay que comparar si el padre ya existe y que indices tieen
//  el level mas la key del paren pueden servir para identificarlo
//  poner el indice ente los corchetes podria ayudar, el
//  orden en el que estan declarados los campo ayuda mas
/*
* me topo con un campo de arreglo
* puede ser el primer nodo
*   creo un arreglo
*   creo un nodo con el primer indice del arreglo
*       agrego el campo a este nodo
* puede existir un nodo
*   no existe el campo en cuestion
*       agrego el campo al ULTIMO nodo existente
*   ya existe el campo en cuestion
*       creo un nodo con el siguiente indice correspondiente
*           agrego el campo a este nodo
* */
function getNode(key, name, root, nodes) {
    const previousNodes = nodes.filter(node => node.name === name)
    if (previousNodes.length === 0) {
        const index = 0
        root[key] = []
        root[key][index] = {}
        return {key, index, name, root: root[key][index]}
    } else {
        const previousIndexes = previousNodes.map(index => index)
        const lastIndex = previousIndexes.sort((a, b) => b - a)[0]
        const index = lastIndex + 1
        if (root[key][index] === undefined) {
            root[key][index] = {}
        }
        const nodeRoot = nodes.filter(node => node.name === name)
        return {key, index, name, root: root[key][index]}
    }
}

function getValue({type, value}) {
    switch (type) {
        case NUMBER_TYPE:
            return Number(value)
        case STRING_TYPE:
            return String(value)
        case OBJECT_TYPE:
            return {}
        default:
            return value
    }
}
