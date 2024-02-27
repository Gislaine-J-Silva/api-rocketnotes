const knex = require('../database/knex')

class NotesController {
  async create(request, response) {
    const { title, description, tags, links } = request.body
    const user_id = request.user.id

    const [note_id] = await knex('notes').insert({
      title,
      description,
      user_id
    })

    const linksInsert = links.map(link => {
      return {
        note_id,
        url: link
      }
    })

    const tagsInsert = tags.map(name => {
      return {
        note_id,
        name,
        user_id
      }
    })

    await knex('links').insert(linksInsert)
    await knex('tags').insert(tagsInsert)

    return response.json()
  }

  async show(request, response) {
    const { id } = request.params

    const note = await knex('notes').where({ id }).first()
    const tags = await knex('tags').where({ note_id: id }).orderBy('name')
    const links = await knex('links')
      .where({ note_id: id })
      .orderBy('created_at')

    return response.json({
      ...note,
      tags,
      links
    })
  }

  async delete(request, response) {
    const { id } = request.params

    await knex('notes').where({ id }).delete()

    return response.json()
  }

  async index(request, response) {
    const { title, tags } = request.query
    const user_id = request.user.id

    let notes

    if (tags) {
      const filterTags = tags.split(',').map(tag => tag.trim()) //cria as palavras de busca de tag em vetor.

      notes = await knex('tags')
        //seleção para o inner join
        .select(['notes.id', 'notes.title', 'notes.user_id'])
        //filtrar pelas tags q seja do id desse usuario q estou utilizando
        .where('notes.user_id', user_id)
        //aplicar o like
        .whereLike('notes.title', `%${title}%`)
        .whereIn('name', filterTags)
        //conectar a tabela de notas, qual campo usar para conectar elas, e o campo que tenho em comum "tags.note_id"
        .innerJoin('notes', 'notes.id', 'tags.note_id')
        .groupBy('notes.id') //para não deixar repetir notas duplicadas.
        .orderBy('notes.title')
    } else {
      notes = await knex('notes')
        .where({ user_id })
        .whereLike('title', `%${title}%`) //busca qualquer palavra antes e depois do title por isso o percentual.
        .orderBy('title')
    }

    const userTags = await knex('tags').where({ user_id })
    const notesWithTags = notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id)

      return {
        ...note,
        tags: noteTags
      }
    })
    return response.json(notesWithTags)
  }
}

module.exports = NotesController
