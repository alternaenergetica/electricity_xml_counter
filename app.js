const fs = require('fs');
const libxml=require("libxmljs");

const pathToFiles='input';

const pathToFile=(fileName)=>{
    return pathToFiles+'/'+fileName;
};

console.log(`Looking for XMLs in ${pathToFiles}...`);
fs.readdir(pathToFiles,'utf8',(err,files)=>{
    if(err===null){
        const aggrObject={};
        const resultList=[];
        let numFiles=0;
        files.forEach((value)=>{
            numFiles++;
            const extension=value.slice(-3);
            if(extension==='xml'||extension==='XML') {
                const xmlAsString = fs.readFileSync(pathToFile(value), 'utf-8').replace(/xmlns/g,'ns');
                const xmlDoc = libxml.parseXmlString(xmlAsString, {noblanks: true});
                const cabecera = xmlDoc.get('//Cabecera');
                const cups = cabecera.get('CUPS').text();
                const emisor = cabecera.get('CodigoREEEmpresaEmisora').text();
                const receptor = cabecera.get('CodigoREEEmpresaDestino').text();
                const distribuidora = emisor!=='1010' ? emisor : receptor;
                const proceso = cabecera.get('CodigoDelProceso').text();
                const paso = cabecera.get('CodigoDePaso').text();
                const codSol = cabecera.get('CodigoDeSolicitud').text();
                resultList.push({cups,distribuidora,proceso,paso,codSol});
            }
        });
        console.log(`Processed a total of ${numFiles}, writing to output file.`);

        const writeStream = fs.createWriteStream(`output/result${+new Date()}.csv`,{flags:'a'});
        writeStream.write(`cups;distribuidora;proceso;paso;cod_sol\n`);
        resultList.forEach((result)=>{
        	writeStream.write(`${result.cups};${result.distribuidora};${result.proceso};${result.paso};${result.codSol}\n`);
        });
        writeStream.end((error)=>{
			console.log('Finished!');
			process.exit();
		});
    }else{
        console.log(err);
    }
});