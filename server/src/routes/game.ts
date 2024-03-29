import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate';

export async function gameRoutes(fastify: FastifyInstance) {
    fastify.get('/games/count', async () => {
        const count = await prisma.game.count();
        return { count }
    })

    fastify.get('/pools/:id/games', {
        onRequest: [authenticate]
    }, async (request) => {

        const getPoolBody = z.object({
            id: z.string()
        })

        const { id } = getPoolBody.parse(request.params)

        const games = await prisma.game.findMany({
            orderBy: {
                date: 'desc'
            },
            include: {
                guesses: {
                    where: {
                        participant: {
                            userId: request.user.sub,
                            poolId: id
                        }
                    }
                }
            }


        })

        return {
            games:
                games.map(game => {
                    return {
                        ...game,
                        guess: game.guesses.length > 0 ? game.guesses[0] : null,
                        guesses: undefined
                    }
                })
        }
    })

    fastify.post('/pools/:poolId/games/:gameId', {
        onRequest: [authenticate]
    }, async (request, reply) => {
        const createGuessParams = z.object({
            poolId: z.string(),
            gameId: z.string(),
        })

        const createGuessBody = z.object({
            firstTeamPoints: z.number(),
            secondTeamPoints: z.number(),
        })

        const { poolId, gameId } = createGuessParams.parse(request.params)
        const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(request.body)

        const participant = await prisma.participant.findUnique({
            where: {
                userId_poolId: {
                    poolId,
                    userId: request.user.sub
                }
            }
        })
        console.log({
            poolId,
            userId: request.user.sub
        })
        if (!participant) {
            return reply.status(400).send({
                message: "You're not allowed to create a guess inside this pool."
            });
        }

        const guess = await prisma.guess.findUnique({
            where: {
                participantId_gameId: {
                    participantId: participant.id,
                    gameId
                }
            }
        })

        if (guess) {
            return reply.status(400).send({
                message: "You already set a guess to this game"
            })
        }

        const game = await prisma.game.findUnique({
            where: {
                id: gameId
            }
        })

        if (!game) {
            return reply.status(400).send({
                message: "Game not found"
            })
        }

        if (game.date < new Date()) {
            return reply.status(400).send({
                message: "You cannot send guess after the game data"
            })
        }

        await prisma.guess.create({
            data: {
                gameId,
                participantId: participant.id,
                firstTeamPoints,
                secondTeamPoints
            }
        })

        return reply.status(201).send();
    })
}
