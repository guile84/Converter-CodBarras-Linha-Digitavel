function convertBL(boleto = "")
{
  let resultado = "";
  if (boleto.length == 44  )
  {
    resultado = calcula_linha(boleto).replace(/[^0-9]/g,'');

    while (resultado.length < 47)
    {
        resultado = resultado + '0';
    }

  }else if (boleto.length == 47  )
  {
    resultado = calcula_barra(boleto).replace(/[^0-9]/g,'');
  }  
  return resultado;
}

//Converte Código de Barras em Linha Digitável
function f_barra() 
{
  var antes  = barra;    
  var depois = calcula_barra(linha);

  barra = depois;

  antes = antes.replace(/[^0-9]/g,'');

  if ((antes != depois) && antes != '')   
    console.log('O código de barras digitado não confere:\n') ;  
  
  f_venc();

  return(false);
}

//Converte Linha Digitável em Código de Barras
function f_linha() 
{
  var antes  = linha.replace(/[^0-9]/g,''); 
  var depois = calcula_linha(barra);

  linha=depois;

  depois = depois.replace(/[^0-9]/g,'');
  
  if ((antes != depois) && antes != '') 
    console.log('O código de barras digitado não confere:\n'+antes+'\n'+depois);  

  return(false);
}

//Verifica o vencimento do Código de Barras
function f_venc() 
{
  if ( barra.substring(5,9) == 0 )  
  {
    venc='O boleto pode ser pago em qualquer data';    
  } else
  {
    venc = fator_vencimento(barra.substring(5,9));
  }

  valor=(barra.substring(9,17)*1)+','+barra.substring(17,19);

  return(false);
}

function calcula_barra(linha)
{
  barra  = linha.replace(/[^0-9]/g,'');

  // CÁLCULO DO DÍGITO DE AUTO CONFERÊNCIA (DAC)   -   5ª POSIÇÃO
  if (modulo11_banco('34191000000000000001753980229122525005423000') != 1) 
    console.log('Função "modulo11_banco" está com erro!');
  
  if (barra.length < 47 ) 
    barra = barra + '00000000000'.substring(0,47-barra.length);
  
  if (barra.length != 47) 
    console.log ('A linha do código de barras está incompleta!'+barra.length);
  
  barra  = barra.substring(0,4)
          +barra.substring(32,47)
          +barra.substring(4,9)
          +barra.substring(10,20)
          +barra.substring(21,31);
    
  if (modulo11_banco(barra.substring(0,4)+barra.substring(5,44)) != barra.substring(4,5))
    console.alert('Digito verificador '+barra.substring(4,5)+', o correto é '+modulo11_banco(barra.substring(0,4)+barra.substring(5,44))+'\nO sistema não altera automaticamente o dígito correto na quinta casa!');

  return(barra);
}

function calcula_linha(barra)
{
  linha = barra.replace(/[^0-9]/g,'');
 
  if (modulo10('399903512') != 8) 
    console.log('Função modulo10 está com erro!');
  
  if (linha.length != 44) 
    console.log('A linha do código de barras está incompleta!');
  
  var campo1 = linha.substring(0,4)+linha.substring(19,20)+'.'+linha.substring(20,24);
  var campo2 = linha.substring(24,29)+'.'+linha.substring(29,34);
  var campo3 = linha.substring(34,39)+'.'+linha.substring(39,44);
  var campo4 = linha.substring(4,5);  // Digito verificador
  var campo5 = linha.substring(5,19); // Vencimento + Valor
  
  if (  modulo11_banco(  linha.substring(0,4)+linha.substring(5,104)  ) != campo4 )
    console.log('Digito verificador '+campo4+', o correto é '+modulo11_banco(  linha.substring(0,4)+linha.substring(5,104)  )+'\nO sistema não altera automaticamente o dígito correto na quinta casa!');
  
  if (campo5 == 0) 
    campo5 = '000';
  
  linha =  campo1 + modulo10(campo1) +' '
          +campo2 + modulo10(campo2) +' '
          +campo3 + modulo10(campo3) +' '
          +campo4 +' '
          +campo5;
 
  return(linha);
}

function fator_vencimento (dias) {

  //Fator contado a partir da data base 07/10/1997
  //*** Ex: 31/12/2011 fator igual a = 5198
  var currentDate, t, d, mes;

  t = new Date();  
  currentDate = new Date();  
  currentDate.setFullYear(1997,9,7);  
  t.setTime(currentDate.getTime() + (1000 * 60 * 60 * 24 * dias));
  mes = (currentDate.getMonth()+1); if (mes < 10) mes = "0" + mes;
  dia = (currentDate.getDate()+1); if (dia < 10) dia = "0" + dia;
  
  return(t.toLocaleString());
}

function modulo10(numero)
{
  numero = numero.replace(/[^0-9]/g,'');

  var soma  = 0;
  var peso  = 2;
  var contador = numero.length-1;
  
  while (contador >= 0) 
  {
    multiplicacao = ( numero.substring(contador,contador + 1) * peso );

    if (multiplicacao >= 10) 
    {
      multiplicacao = 1 + (multiplicacao-10);
    }

    soma = soma + multiplicacao;
  
    if (peso == 2) 
    {      
      peso = 1;
    } else 
    {
      peso = 2;
    }

    contador = contador - 1;
  }

  var digito = 10 - (soma % 10);
    
  if (digito == 10) 
    digito = 0;

  return digito;
}
   
function debug(txt)
{
  t = t + txt + '\n';
}

function modulo11_banco(numero)
{
  numero = numero.replace(/[^0-9]/g,'');

  var soma  = 0;
  var peso  = 2;
  var base  = 9;
  var resto = 0;
  var contador = numero.length - 1;

  for (var i=contador; i >= 0; i--)
  {    
    soma = soma + ( numero.substring(i,i+1) * peso);
    
    if (peso < base) {
      peso++;
    } else 
    {
      peso = 2;
    }
  }

  var digito = 11 - (soma % 11);
  
  if (digito >  9) 
    digito = 0;
  
  /* Utilizar o dígito 1(um) sempre que o resultado do cálculo padrão for igual a 0(zero), 1(um) ou 10(dez). */
  if (digito == 0) 
    digito = 1;

  return digito;
}