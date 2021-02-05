1. 脚本文件夹中查找 
查找下列代码，然后删除所在的语句，注意逻辑。
> "undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);   
> indexOf('GITHUB')
> indexOf("GITHUB")

2. 脚本文件夹中查找  
> ./jdCookie   
> ./sendNotify  
> ./USER_AGENTS   
> ./jdDreamFactoryShareCodes  
> ./jdFactoryShareCodes.js  
> ./jdFruitShareCodes.js  
> ./jdJxncShareCodes  
> ./jdJxncTokens  
> ./jdPetShareCodes  
> ./jdPlantBeanShareCodes  

  替换为 
> ../jdCookie   
> ../sendNotify  
> ../USER_AGENTS  
> ../jdDreamFactoryShareCodes  
> ../jdFactoryShareCodes.js  
> ../jdFruitShareCodes.js  
> ../jdJxncShareCodes  
> ../jdJxncTokens  
> ../jdPetShareCodes  
> ../jdPlantBeanShareCodes  

PS. VScode 文件夹内查找：  
1. 直接在文件夹上右键 Find in folder  
2. 搜索页面 要包含的文件 填入 文件夹路径  
举例:  
要包含的文件 ./jd_checkin_action/Scripts    
排除的文件 ./jd_checkin_action/Scripts/README.md  