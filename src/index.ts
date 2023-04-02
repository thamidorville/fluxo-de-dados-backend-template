import express, { Request, Response } from 'express'
import cors from 'cors'
import { accounts } from './database'
import { ACCOUNT_TYPE } from './types'

const app = express()

app.use(express.json())
app.use(cors())

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003")
})

app.get("/ping", (req: Request, res: Response) => {
    res.send("Pong!")
})

app.get("/accounts", (req: Request, res: Response) => {
    res.send(accounts)
})

//exercicio 1 refatorar o endpoint de Get account by id
//refatorar p o uso do bloco try/catch
//validacao do resultado: 
// - caso nenhuma account seja encontrada na pesquisa por id, retornar 
//um erro 404
//- mensagem de erro: "Conta nao encontrada. Verifique a 'id'."
app.get("/accounts/:id", (req: Request, res: Response) => {
try { 
    const id = req.params.id

    const result = accounts.find((account) => account.id === id) 
 
   if (!result){
    res.status(404)
    throw new Error('Conta nao encontrada. Verifique a id.')
   }

   res.status(200).send(result)
} catch (error) {
    console.log(error)

    if(res.statusCode === 200){
        res.status(500)
     
    }

    if(error instanceof Error) {
        res.send(error.message)
    }else {
        res.send("erro inesperado")
    }

    res.send(error.message)//acessando a mensagem do throw new Error
} 
})

//exercicio 2 - refatorar o enpoint DELETE ACCOUNT
// - toda id de conta deve comecar com a letra a
// - refatorar para o uso do bloco try/catch
// - validacao de input:
// * caso a id recebida nao inicie com a letra `a` sera retornado
//um erro 400
// mensagem de erro: "id invalido. Deve iniciar com letra a."

app.delete("/accounts/:id", (req: Request, res: Response) => {
    try {
    
    const id = req.params.id

    if(id[0] !== 'a'){
        res.status(400)
        throw new Error("id invalido. Deve iniciar com a letra 'a'.")
    }

    const accountIndex = accounts.findIndex((account) => account.id === id)

    if (accountIndex >= 0) {
        accounts.splice(accountIndex, 1)
    }

    res.status(200).send("Item deletado com sucesso")

    } catch (error) {
        console.log(error)

    if(res.statusCode === 200){
        res.status(500)
     
    }

    if(error instanceof Error) {
        res.send(error.message)
    }else {
        res.send("erro inesperado")
    }
    }
})

// Exercicio 3 - EDIT ACCOUNT 
//agora entramos no endpoint que possui um body
//todos os valores do body devem ser verificados para evitar erros de execucao
//req.body.balance(newBalance)
// - deve ser number
// - deve ser maior ou igual a zero
//req.body.type(newType)
// - deve valer um dos tipos de conta do enum

app.put("/accounts/:id", (req: Request, res: Response) => {
    try {
        const id = req.params.id

    const newId = req.body.id as string | undefined
    const newOwnerName = req.body.ownerName as string | undefined
    const newBalance = req.body.balance as number | undefined
    const newType = req.body.type as ACCOUNT_TYPE | undefined

   if(newBalance !== undefined){
    if(typeof newBalance !== "number"){
        res.status(400)
        throw new Error("balance deve ser do tipo number")
    }
    if(newBalance < 0){
        res.status(400)
        throw new Error("Balance deve ser maior ou igual a zero")
    }
   }

//newType

    if(newType !== undefined){
        if( //aqui verifico se ele tem dados diferentes do enum
            newType !== ACCOUNT_TYPE.GOLD &&
            newType !== ACCOUNT_TYPE.PLATINUM &&
            newType !== ACCOUNT_TYPE.BLACK
            ){
                res.status(400)
                throw new Error("type deve ser um dos tipos validos.")
            }
    }

    const account = accounts.find((account) => account.id === id) 

    if(!account){
        res.status(400)
        throw new Error('conta nao encontrada')
    }

    //req.body.id(newId)
    // - string que inicia com a letra a
    //req.body.ownerName (newOwnerName)
    //- string com no minimo 2 caracteres

    if(newId[0] !== "a" && newId[0] !== "A"){
        throw new Error("id deve iniciar com a letra a.")
    }
    if (newOwnerName.length < 2){
        throw new Error("Nome deve ter no minimo 2 caracteres")
    }

    if (account) {
        account.id = newId || account.id
        account.ownerName = newOwnerName || account.ownerName
        account.type = newType || account.type

        account.balance = isNaN(newBalance) ? account.balance : newBalance
    }

    res.status(200).send("Atualização realizada com sucesso")
    } catch (error) {
        console.log(error)

    if(res.statusCode === 200){
        res.status(500)
     
    }

    if(error instanceof Error) {
        res.send(error.message)
    }else {
        res.send("erro inesperado")
    }
    }
    
})