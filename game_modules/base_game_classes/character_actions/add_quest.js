module.exports = function add_quest(quest, tag) {
    this.data.quest = {id: quest.id, tag: tag}
    this.savings.transfer(quest.savings, this.savings.get())
}