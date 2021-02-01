/**
fetch('http://localhost:8100/api.php', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Svampsoppa',
      tags: [
        'veggo', 'soppa'
      ],
      see: [],
      comments: 'Test-kommentar som är ganska lång',
      ingredients: [
        {
          name: 'Champinioner',
          quantity: '1'
        },
        {
          name: 'Lök',
          quantity: '1'
        },
        {
          name: 'Smör',
          quantity: ''
        },
      ]
    }),
  headers: {
    'Content-type': 'application/json; charset=UTF-8',
    'X-Auth': 'test'
  }
})
.then(response => response.text())
.then(json => console.log(json))
**/

async function run() {
  const response = await fetch('/api.php')
  const data = await response.json()
  window.onpopstate = ev => {
    if (ev.state) {
      switch (ev.state.type) {
        case 'view':
          render(ev.state.data, window.localStorage.getItem('auth'), data)
          return
        case 'edit':
          renderInput(data.data, ev.state.data)
          return
        case 'add':
          renderInput(data.data)
          return
        case 'list':
          console.log(ev.state)
          renderRecepies(data.data, ev.state.filter)
          return
      }
    } else {
      renderList(data.data)
    }
  }

  renderList(data.data)
}

function getTagsFromData(data) {
  const tags = new Set()
  data.forEach(r => {
    r.tags.forEach(t => tags.add(t))
  })
  return tags
}

function renderList(data, filter = false) {
  const list = document.getElementById('data')
  list.innerHTML = ''
  const divs =  ['add', 'tags', 'recepies']
  divs.forEach(id => {
    const tmp = document.createElement('DIV')
    tmp.setAttribute('id', id)
    list.appendChild(tmp)
  })

  if (window.localStorage.getItem('auth')) {
    add.appendChild(document.createTextNode('Add new'))
    add.addEventListener('click', () => {
      history.pushState({type: 'add'}, 'Add new', '?addnew')
      renderInput(data)
    })
  }

  renderTags(data)
  renderRecepies(data, filter)
}


function renderInput(existing, data = {}) {
  const tagsSuggestions = getTagsFromData(existing)

  const s = document.getElementById('data')
  s.innerHTML = ''

  const titleDiv = document.createElement('DIV')
  s.appendChild(titleDiv)
  const title = document.createElement('INPUT')
  title.setAttribute('placeholder', 'Name')
  titleDiv.appendChild(title)
  if (data.name) {
    title.value = data.name
  }

  const ingredients = data.ingredients || []
  const ingredientsList = document.createElement('UL')
  s.appendChild(ingredientsList)
  const renderIngredients = () => {
    ingredientsList.innerHTML = ''
    ingredients.forEach((v, k) => {
      const node = document.createElement('LI')
      const text = document.createTextNode(v.quantity + ' ' + v.name)
      node.appendChild(text)
      node.addEventListener('click', () => {
        ingredients.splice(k, 1)
        renderIngredients()
      })
      ingredientsList.appendChild(node)
    })
  }
  renderIngredients()

  const addIngredientsDiv = document.createElement('DIV')
  const ingredientQty = document.createElement('INPUT')
  const ingredientName = document.createElement('INPUT')
  const ingredientAdd = document.createElement('BUTTON')

  ingredientName.addEventListener('keyup', ev => {
    if (ev.keyCode === 13) { // enter
      ev.preventDefault()
      ingredientAdd.click()
    }
  })

  ingredientQty.setAttribute('placeholder', '#')
  ingredientName.setAttribute('placeholder', 'Name')
  ingredientAdd.appendChild(document.createTextNode('Add'))

  addIngredientsDiv.appendChild(ingredientQty)
  addIngredientsDiv.appendChild(ingredientName)
  addIngredientsDiv.appendChild(ingredientAdd)
  s.appendChild(addIngredientsDiv)

  ingredientAdd.addEventListener('click', () => {
    ingredients.push({
      name: ingredientName.value,
      quantity: ingredientQty.value
    })
    ingredientName.value = ''
    ingredientQty.value = ''
    ingredientQty.focus()
    renderIngredients()
  })

  const comments = document.createElement('TEXTAREA')
  comments.setAttribute('rows', 15)
  comments.setAttribute('cols', 60)
  if (data.comments) {
    comments.value = data.comments
  }
  s.appendChild(comments)

  const tags = data.tags || []
  const tagsList = document.createElement('UL')
  s.appendChild(tagsList)
  const renderAddedTags = () => {
    tagsList.innerHTML = ''
    tags.forEach((v, k) => {
      const node = document.createElement('LI')
      const text = document.createTextNode(v)
      node.appendChild(text)
      node.addEventListener('click', () => {
        tags.splice(k, 1)
        renderAddedTags()
      })
      tagsList.appendChild(node)
    })
  }
  renderAddedTags()

  const addTagsDiv = document.createElement('DIV')
  const tagsInput = document.createElement('INPUT')
  const tagsSelect = document.createElement('SELECT')
  const tagsAdd = document.createElement('BUTTON')

  const blank = document.createElement('OPTION')
  blank.value = ''
  blank.appendChild(document.createTextNode('No tag'))
  tagsSelect.appendChild(blank)

  tagsSuggestions.forEach(t => {
    const opt = document.createElement('OPTION')
    opt.value = t
    opt.appendChild(document.createTextNode(t))
    tagsSelect.appendChild(opt)
  })

  tagsInput.setAttribute('placeholder', 'Tag with')
  tagsAdd.appendChild(document.createTextNode('Add'))

  addTagsDiv.appendChild(tagsSelect)
  addTagsDiv.appendChild(tagsInput)
  addTagsDiv.appendChild(tagsAdd)
  s.appendChild(addTagsDiv)

  tagsAdd.addEventListener('click', () => {
    if (tagsInput.value) {
      tags.push(tagsInput.value)
      tagsInput.value = ''
    } else {
      tags.push(tagsSelect.value)
      tagsSelect.value = ''
    }
    renderAddedTags()
  })

  const see = data.see || []
  const seeList = document.createElement('UL')
  s.appendChild(seeList)
  const renderAddedSee = () => {
    seeList.innerHTML = ''
    see.forEach((v, k) => {
      const node = document.createElement('LI')
      const r = existing.filter(i => i.id == v)
      const text = document.createTextNode(r[0].name)
      node.appendChild(text)
      node.addEventListener('click', () => {
        see.splice(k, 1)
        renderAddedSee()
      })
      seeList.appendChild(node)
    })
  }
  renderAddedSee()

  const addSeeDiv = document.createElement('DIV')
  const seeSelect = document.createElement('SELECT')
  const seeAdd = document.createElement('BUTTON')

  existing.forEach(t => {
    const opt = document.createElement('OPTION')
    opt.value = t.id
    opt.appendChild(document.createTextNode(t.name))
    seeSelect.appendChild(opt)
  })

  seeAdd.appendChild(document.createTextNode('Add'))

  addSeeDiv.appendChild(seeSelect)
  addSeeDiv.appendChild(seeAdd)
  s.appendChild(addSeeDiv)

  seeAdd.addEventListener('click', () => {
    see.push(seeSelect.value)
    renderAddedSee()
  })

  const save = document.createElement('BUTTON')
  save.appendChild(document.createTextNode('Save'))
  save.addEventListener('click', () => {
    const toSave = {
      name: title.value,
      tags: tags,
      see: see,
      comments: comments.value,
      ingredients: ingredients
    }

    if (data.id) {
      toSave.id = data.id
    }
    fetch('/api.php', {
      method: toSave.id ? 'PUT' : 'POST',
      body: JSON.stringify(toSave),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'X-Auth': window.localStorage.getItem('auth')
      }
    })
      .then(response => response.json())
      .then(response => {
        if (!data.id) {
          existing.push(response.data)
        } else {
          Object.keys(toSave).forEach(k => {
            data[k] = toSave[k]
          })
        }
        history.pushState({type: 'list'}, 'List', '?')
        renderList(existing)
      })
  })
  s.appendChild(save)
}

function renderTags(data) {
  const list = document.getElementById('tags')
  list.setAttribute('id', 'tags')
  list.innerHTML = ''
  const tags = new Set()
  data.forEach(r => {
    r.tags.forEach(t => tags.add(t))
  })
  tags.forEach(t => {
    const s = document.createElement('SPAN')
    const text = document.createTextNode(t)
    s.appendChild(text)
    list.appendChild(s)
    s.addEventListener('click', () => {
      history.pushState({filter: t, type: 'list'}, t, '?filter=' + t)
      renderRecepies(data, t)
    })
  })
}

function renderRecepies(data, filter = false) {
  const list = document.getElementById('recepies')
  if (list === null) {
    return renderList(data, filter)
  }
  list.innerHTML = ''
  let items = data
  if (filter) {
    items = data.filter(d => d.tags.includes(filter))
  }
  items.sort((a, b) => {
    return a.name > b.name
  })

  items.forEach(i => {
    const entry = document.createElement('DIV')
    const text = document.createTextNode(i.name)
    entry.classList.add('listItem')
    entry.appendChild(text)
    list.appendChild(entry)
    entry.addEventListener('click', () => {
      history.pushState({data: i, type: 'view'}, i.name, '?id=' + i.id)
      render(i, window.localStorage.getItem('auth'), data)
    })
  })
}

function render(data, edit, others) {
  const receipt = document.getElementById('data')
  receipt.innerHTML = ''
  const h3 = document.createElement('H3')
  const name = document.createTextNode(data.name)
  h3.appendChild(name)
  receipt.appendChild(h3)

  const ingredients = document.createElement('UL')
  data.ingredients.forEach(i => {
    const node = document.createElement('LI')
    const text = document.createTextNode(i.quantity + ' ' + i.name)
    node.appendChild(text)
    ingredients.appendChild(node)
  })
  receipt.appendChild(ingredients)

  const comments = document.createElement('DIV')
  comments.innerHTML = data.comments.replaceAll('\n', '<br>')
  receipt.appendChild(comments)

  const see = document.createElement('UL')
  receipt.appendChild(see)
  data.see.forEach((v, k) => {
    const node = document.createElement('LI')
    const r = others.filter(i => i.id == v)
    const text = document.createTextNode(r[0].name)
    node.appendChild(text)
    node.addEventListener('click', () => {
      history.pushState({data: r[0], type: 'view'}, r[0].name, '?id=' + r[0].id)
      render(r[0], edit, others)
    })
    see.appendChild(node)
  })

  if (edit) {
    const editButton = document.createElement('BUTTON')
    editButton.appendChild(document.createTextNode('Edit'))
    editButton.addEventListener('click', () => {
      history.pushState({data: data, type: 'edit'}, 'Edit ' + data.name, '?edit=' + data.id)
      renderInput(others, data)
    })
    receipt.appendChild(editButton)

    const deleteButton = document.createElement('BUTTON')
    deleteButton.appendChild(document.createTextNode('Delete'))
    deleteButton.addEventListener('click', () => {
      fetch('/api.php?id=' + data.id, {
        method: 'DELETE',
        headers: {
          'X-Auth': window.localStorage.getItem('auth')
        }
      })
      .then(response => {
        const index = others.findIndex(el => el.id === data.id)
        others.splice(index, 1)
        history.pushState({type: 'list'}, 'List', '?')
        renderList(others)
      })
    })
    receipt.appendChild(deleteButton)
  }
}

