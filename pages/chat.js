import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

// Como fazer AJAX: https://medium.com/@omariosouto/entendendo-como-fazer-ajax-com-a-fetchapi-977ff20da3c6
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzMwNzUxMCwiZXhwIjoxOTU4ODgzNTEwfQ.2aBbRoHRp8XLer2sYXTe5epDjrSnRzEK87NIjn06a_s';
const SUPABASE_URL = 'https://xkxhoohwulknxpxbonbe.supabase.co';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem) {
    return supabaseClient
        .from('mensagens')
        .on('INSERT', ( respostaLive ) => {
            adicionaMensagem(respostaLive.new);
        })
        .subscribe();
}

export default function ChatPage() {
    const [mensagem, setMensagem] = React.useState('');
    const [listaDeMensagens, setListaDeMensagens] = React.useState([
        //{
        //    id: 1,
        //    de: 'gracibrea',
        //    texto: ':sticker: https://www.alura.com.br/imersao-react-4/assets/figurinhas/Figurinha_1.png',
        //}
    ]);

    React.useEffect(() =>{
        supabaseClient
            .from('mensagens')
            .select('*')
            //.order('id', { ascending: false }) Caso estivesse invertendo a ordem sob refresh da página, isso resolveria. No meu caso não precisa porque a ordem depois do refresh já estava ok.
            .then(({ data }) => {
                console.log('Dados da consuta:', data);
                setListaDeMensagens(data);
            });

        escutaMensagensEmTempoReal((novaMensagem) => {
            console.log('Nova Mensagem:', novaMensagem);
            setListaDeMensagens((valorAtualDaLista) => {
                return [
                    ...valorAtualDaLista,
                    novaMensagem, //invertendo esta ordem, não precisa mexer no column-reverse do css
                ]
            });
        });
    }, []);

    
    /*
    //Usuário
    - Usuário digita no campo textearea
    - Aperta enter para enviar
    - Tem que adicionar o texto na listagem

    //DEV
    - [X] Campo criado
    - [+-] Vamos usar o onChange e o useState (ter um if para caso seja enter, limpar a variável)
    - [X] Lista de mensagenss

    */
function handleNovaMensagem(novaMensagem) {
    const mensagem = {
        // id: listaDeMensagens.length + 1,
        de: 'gracibrea',
        texto: novaMensagem,
    };

    supabaseClient
        .from('mensagens')
        .insert([
            // Tem que ser um objeto com os MESMOS CAMPOS que você escreveu no supabase
            mensagem            
        ])
        .then(({ data }) => {
            console.log('Criando mensagem: ', data);
        });
    
    setMensagem('');
}
    return (
        <Box
        styleSheet={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: appConfig.theme.colors.primary[500],
            backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
            backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
            color: appConfig.theme.colors.neutrals['000']
        }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >
                    <MessageList mensagens={listaDeMensagens} /> 
                    {/*Teste... Tá mudando o valor {mensagem} */}
                    
                    {/*{listaDeMensagens.map((mensagemAtual) => {
                        console.log(mensagemAtual)
                        return (
                            <li key={mensagemAtual.id}>
                                {mensagemAtual.de}: {mensagemAtual.texto}
                            </li>
                        )
                    })}*/}
                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={(event) =>{
                                console.log(event);
                                const valor = event.target.value;
                                setMensagem(valor);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter'){
                                    event.preventDefault();
                                    handleNovaMensagem(mensagem);
                                }
                                
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],   
                            }}
                        />
                        {/* CallBack */}
                        <ButtonSendSticker
                            onStickerClick={(sticker) => {
                                console.log('[USANDO O COMPONENTE] Salva esse sticker no banco', sticker);
                                handleNovaMensagem(':sticker:' + sticker);
                            }}
                         />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    console.log(props);
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflowY: 'scroll', //estava scroll
                display: 'flex',
                flexDirection: 'column', //estava column-reverse
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagem) => {
                return(
                <Text
                    key={mensagem.id}
                    tag="li"
                    styleSheet={{
                        borderRadius: '5px',
                        padding: '6px',
                        marginBottom: '12px',
                        hover: {
                            backgroundColor: appConfig.theme.colors.neutrals[700],
                        }
                    }}
                >
                    <Box
                        styleSheet={{
                            marginBottom: '8px',
                        }}
                    >
                        <Image
                            styleSheet={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'inline-block',
                                marginRight: '8px',
                            }}
                            src={`https://github.com/${mensagem.de}.png`}
                        />
                        <Text tag="strong">
                            {mensagem.de}
                        </Text>
                        <Text
                            styleSheet={{
                                fontSize: '10px',
                                marginLeft: '8px',
                                color: appConfig.theme.colors.neutrals[300],
                            }}
                            tag="span"
                        >
                            {(new Date().toLocaleDateString())}
                        </Text>
                    </Box>
                    {/* Declarativo */}
                    {/*Condicional: {mensagem.texto.startsWith(':stiker:').toString()}*/}
                    {mensagem.texto.startsWith(':sticker:')
                    ? (
                        <Image src={mensagem.texto.replace(':sticker:', '')} />
                    )
                    : (
                        mensagem.texto
                    )}

                </Text>

                );
            })}
        

            
        </Box>
    )
}